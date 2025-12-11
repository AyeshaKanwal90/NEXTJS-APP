"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Grid,
  Paper,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Link,
  Alert,
  CircularProgress
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setResetSuccess(true);

      router.replace("/", { scroll: false });

      setTimeout(() => setResetSuccess(false), 5000);
    }
  }, [searchParams, router]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
      return;
    }

    if (res.status === 401 && data.redirect) {
      setErrorMessage(data.message);

      setTimeout(() => {
        router.push("/register");
      }, 3000);

      return;
    }

    setErrorMessage(data.message || "An unexpected login error occurred.");
  };

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        px: 2,
      }}
    >
      <Grid
        container
        spacing={4}
        gap={8}
        alignItems="center"
        justifyContent="center"
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* LEFT — FORM */}
        <Grid
          item
          xs={10}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Box sx={{ maxWidth: 420, width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Login
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Login to access your travelwise account
            </Typography>


            {resetSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your password has been successfully reset. Please login with your new password.
              </Alert>
            )}


            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={() => setRemember(r => !r)} />}
                  label="Remember me"
                />

                <Link variant="body2"
                  component="button"
                  underline="none"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot Password
                </Link>
              </Box>


              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleLogin}
              >
                Login
              </Button>

              <Box textAlign="center">
                Don't have an account?{" "}
                <Link component="button" onClick={() => router.push("/register")} underline="none">
                  Sign Up
                </Link>
              </Box>

              <Divider>Or login with</Divider>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="outlined" size="large" startIcon={<FaFacebookF />} sx={{ minWidth: 120 }}></Button>

                <GoogleLoginButton mode="login" />
                <Button variant="outlined" size="large" startIcon={<FaApple />} sx={{ minWidth: 120 }}></Button>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        {/* RIGHT — IMAGE */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Box
            component="img"
            src="/assets/usertask-login1.png"
            alt="login illustration"
            sx={{
              width: "100%",
              maxWidth: 400,
              height: "auto",
              objectFit: "contain",
              borderRadius: 3,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <Container sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <LoginContent />
    </Suspense>
  );
}
