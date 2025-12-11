"use client";

import { useState } from "react";
import {
  Box,
  Grid,
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
  Link
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FaFacebookF, FaGoogle, FaApple } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "@mui/material";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, password })
      });

      if (res.ok) {

        alert("Success! Your account has been created.");

        router.push("/");
      } else {

        const errorData = await res.json();
        const errorMessage = errorData.message || 'Registration failed due to a server error.';
        alert(errorMessage);

      }
    } catch (error) {
      // Handle network errors
      alert("Network error: Could not connect to the server.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        width: "100%",
        minheight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflow: "hidden",
        px: 2,
        pt: 4,
      }}
    >
      <Grid
        container
        spacing={8}
        gap={8}
        sx={{
          maxWidth: "1200px",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* LEFT — Illustration*/}
        <Grid item xs={12} md={6}>

          <Box
            component="img"
            src="/assets/usertask-signup.png"
            alt="signup illustration"
            sx={{
              width: "auto",
              maxWidth: "100%",
              height: "90vh",
              objectFit: "contain",
              borderRadius: 3,
              boxShadow: 1,
              bgcolor: "background.paper",
            }}
          />
        </Grid>

        {/* RIGHT — Form */}
        <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: "100%", maxWidth: 465 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Sign up
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Let's get you all set up so you can access your personal account.
            </Typography>

            <Grid container spacing={2}>
              {/* FIRST NAME */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>

              {/* LAST NAME */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>

              {/* EMAIL */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              {/* PHONE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              {/* PASSWORD */}

              <TextField
                fullWidth
                size="small"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />




              <TextField
                fullWidth
                size="small"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={password !== confirm && confirm.length > 0}
                helperText={password !== confirm && confirm.length > 0 ? "Passwords do not match" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />


              {/* TERMS */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
                  label={
                    <Typography variant="body2">
                      I agree to the <Link>Terms</Link> and <Link>Privacy Policies</Link>
                    </Typography>
                  }
                />
              </Grid>

              {/* BUTTON */}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={submit}
                disabled={!agree || loading}
              >
                {loading ? 'Creating Account...' : 'Create account'}
              </Button>


              {/* Login Link */}

              <Typography variant="body2" sx={{ textAlign: "center", width: "100%" }}>
                Already have an account?{" "}
                <Link component="button" onClick={() => router.push("/")} underline="none">
                  Login
                </Link>
              </Typography>


              <Divider sx={{ width: "100%", maxWidth: 300, margin: "0 auto" }}>
                Or Sign up with
              </Divider>


              {/* Google Auth Error Alert */}
              {searchParams.get("error") === "account_not_found" && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Account not found. Please sign up here to create a new account.
                </Alert>
              )}

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="outlined" startIcon={<FaFacebookF />} sx={{ minWidth: 145 }} />
                  <GoogleLoginButton mode="register" />
                  <Button variant="outlined" startIcon={<FaApple />} sx={{ minWidth: 145 }} />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}