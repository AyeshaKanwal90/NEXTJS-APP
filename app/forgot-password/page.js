"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());
    
    setLoading(false);

    if (res.ok) {
      setMsg("A verification code has been sent to your email.");
      setTimeout(() => {
        router.push(`/verify-code?email=${encodeURIComponent(email)}`);
      }, 1200);
    } else {
      setMsg(res.message || "Something went wrong.");
    }
  };

  return (
    <Container maxWidth="xl" disableGutters
      sx={{ width: "100%", height: "100vh", display: "flex",
        justifyContent: "center", alignItems: "center", px: 2 }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
        alignItems: "center",
        gap: 8,
        width: "100%", maxWidth: 1000
      }}>
        
        {/* LEFT — FORM */}
        <Box sx={{ width: "100%", maxWidth: 480, pr: { md: 4 } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/")}
            sx={{ mb: 2 }}
          >
            Back to login
          </Button>

          <Typography variant="h4" fontWeight={700} mb={1}>
            Forgot your password?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Don't worry, happens to all of us. Enter your email below to recover your password.
                  </Typography>

          <TextField
            fullWidth 
            label="Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading && email) {
                handleSubmit();
              }
            }}
            sx={{ mb: 2 }}
          />

          {msg && (
            <Typography sx={{ mb: 2, color: msg.includes("sent") ? "green" : "red" }}>
              {msg}
            </Typography>
          )}

          <Button
            variant="contained" fullWidth
            onClick={handleSubmit} disabled={loading}
            sx={{ height: 45 }}
          >
            {loading ? "Sending..." : "Submit"}
          </Button>

          <Divider sx={{ my: 4 }}>Or login with</Divider>

          <Box sx={{ display: "flex", gap: 2}}>
           <Button variant="outlined" size="large" startIcon={<FaFacebookF />} sx={{ minWidth: 140 }}></Button>
           <Button variant="outlined" size="large" startIcon={<FaGoogle />} sx={{ minWidth: 140 }}></Button>
           <Button variant="outlined" size="large" startIcon={<FaApple />} sx={{ minWidth: 140 }}></Button>
          </Box>
        </Box>

        {/* RIGHT — IMAGE */}
        <Box
          component="img"
          src="/assets/usertask-forgotPassword.png"
          sx={{
            width: { xs: "80%", md: "50%" }, maxWidth: 420,
            mb: { xs: 4, md: 0 }
          }}
        />
      </Box>
    </Container>
  );
}