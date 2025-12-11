"use client";

import { Button } from "@mui/material";
import { FaGoogle } from "react-icons/fa";

export default function GoogleLoginButton({ mode = "login" }) {
  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google?mode=${mode}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Button
        variant="outlined"
        size="large"
        sx={{ minWidth: 120 }}
        startIcon={<FaGoogle />}
        onClick={handleGoogleLogin}
      >

      </Button>
    </div>
  );
} 