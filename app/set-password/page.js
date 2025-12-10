"use client";

import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box, Button, Container, IconButton, InputAdornment,
  TextField, Typography
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSetPassword = async () => {
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    const resetToken = sessionStorage.getItem("resetToken");

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ resetToken, newPassword: password }),
    }).then((r) => r.json());

    if (res.ok) {
      router.push("/?reset=success");
    } else {
      setMsg(res.message || "Something went wrong.");
    }
  };

  return (
    <Container maxWidth="xl" disableGutters
      sx={{ width:"100%", height:"100vh", display:"flex",
        justifyContent:"center", alignItems:"center", px:2 }}
    >
      <Box sx={{
        display:"flex", flexDirection:{xs:"column-reverse", md:"row"},
        gap: 8,
        width:"100%", maxWidth:1000
      }}>

        {/* LEFT */}
        <Box sx={{ width:"100%", maxWidth:480, pr:{md:4}, mt: 9 }}>
          <Typography variant="h4" fontWeight={700} mb={2}>
            Set a password
          </Typography>
 <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}  >
           <b> Your previous password has been reseted. Please set a new password 
            for your account.
           </b>
          </Typography>
          <TextField
            label="Create Password"
            value={password}
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb:2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow(!show)}>
                    {show ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Re-enter Password"
            value={confirm}
            type={show ? "text" : "password"}
            onChange={(e) => setConfirm(e.target.value)}
            fullWidth
            sx={{ mb:3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow(!show)}>
                    {show ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {msg && <Typography color="red" mb={2}>{msg}</Typography>}

          <Button variant="contained" fullWidth onClick={handleSetPassword} sx={{ height:45 }}>
            Set Password
          </Button>
        </Box>

        {/* RIGHT */}
        <Box
          component="img"
          src="/assets/usertask-login.png"
          sx={{ width:{xs:"80%", md:"50%"}, maxWidth:420 }}
        />
      </Box>
    </Container>
  );
}
