"use client";

import { Button } from "@mui/material";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  // 1. New state to track if GSI is fully initialized
  const [isGsiLoaded, setIsGsiLoaded] = useState(false); 

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return setError("Google Client ID not configured");

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // 2. Initializing GSI without ux_mode: "redirect" or redirect_uri
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        // Removed ux_mode: "redirect" and redirect_uri to use the client-side token flow
      });
      // 3. Set loaded state *after* successful initialization
      setIsGsiLoaded(true);
    };

    script.onerror = () => setError("Failed to load Google SDK");
    document.body.appendChild(script);

    // 4. Cleanup function to prevent conflicts when component unmounts
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.cancel(); // Cancel any ongoing GSI session/prompt
      }
      // Note: Typically you don't need to remove the script itself.
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleGoogleLogin = () => {
    if (!window.google) return alert("Google SDK not loaded");
    
    // Check for GSI loaded state before attempting to prompt
    if (!isGsiLoaded) return; 

    // The GSI prompt function
    window.google.accounts.id.prompt(); 
  };

  const handleGoogleResponse = async (response) => {
    // This handler receives the JWT credential from GSI on the client side
    if (!response.credential) return alert("No credential returned");

    try {
      // Your existing logic to post the JWT to your backend for verification
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        alert(data.message || "Google login failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Google login error.");
    }
  };

  return (
    <Button
      variant="outlined"
      size="large"
      sx={{ minWidth: 120 }}
      startIcon={<FaGoogle />}
      onClick={handleGoogleLogin}
      // 5. Disable the button until GSI is fully initialized (isGsiLoaded is true)
      disabled={!isGsiLoaded} 
    >
      
    </Button>
  );
}