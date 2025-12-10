"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const em = searchParams.get("email");
    if (em) {
      setEmail(em);
    } else {
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setMsg("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/verify-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetCode: code }),
    }).then((r) => r.json());

    setLoading(false);

    if (res.ok) {
      sessionStorage.setItem("resetToken", res.resetToken);
      router.push("/set-password");
    } else {
      setMsg(res.message || "Invalid or expired code.");
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
        <Box sx={{ width:"100%", maxWidth:480, pr:{md:4},  mt: 9}}>
          <Button startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/forgot-password")}
            sx={{ mb:2 }}
          >
            Back to login
          </Button>

          <Typography variant="h4" fontWeight={700} mb={1}>
            Verify code
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
           <b> An authentication code has been sent to your email.</b>
          </Typography>

          <TextField
            label="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            type={showCode ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCode(!showCode)}>
                    {showCode ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {msg && (
            <Typography color={msg.includes("sent") ? "green" : "red"} mb={2}>
              {msg}
            </Typography>
          )}

          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleVerify} 
            disabled={loading || code.length !== 6}
            sx={{ height:45 }}
          >
            {loading ? "Verifying..." : "Verify"}
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