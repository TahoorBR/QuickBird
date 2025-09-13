"use client";

import { useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/use-auth";
import { useTheme } from "../../../contexts/ThemeContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const { login, loading } = useAuth();
  const { mode, theme } = useTheme();
  const sage = theme.palette.primary.main;

  const handleLogin = async () => {
    setMessage("");
    try {
      await login(email, password);
      setMessage("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setMessage(err.message || "Login failed!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        px: 2,
        background: mode === 'dark' 
          ? "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)" 
          : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background:
            `radial-gradient(circle at center, ${sage}20, transparent 70%)`,
          animation: "pulse 20s infinite alternate",
          zIndex: 0,
        }}
      />

      <Paper
        sx={{
          position: "relative",
          zIndex: 1,
          p: 6,
          borderRadius: 4,
          width: "100%",
          maxWidth: 480,
          background: mode === 'dark' 
            ? "rgba(17,17,17,0.55)" 
            : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${sage}55`,
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.85)",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <LoginIcon sx={{ fontSize: 60, color: sage, mb: 1 }} />
          <Typography variant="h4" sx={{ color: mode === 'dark' ? "#fff" : "#000", fontWeight: 700 }}>
            QuickBird Login
          </Typography>
          <Typography sx={{ color: mode === 'dark' ? "#ccc" : "#666", mt: 1 }}>
            Login to manage your projects
          </Typography>
        </Box>

        <TextField
          label="Email"
          fullWidth
          sx={{
            mb: 3,
            input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
            label: { color: mode === 'dark' ? '#ccc' : '#666' },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
              },
            },
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{
            mb: 1,
            input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
            label: { color: mode === 'dark' ? '#ccc' : '#666' },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
              },
            },
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: sage,
            color: "#000",
            fontWeight: "bold",
            fontSize: 16,
            py: 1.5,
            mb: 2,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#000",
              color: sage,
              border: `1px solid ${sage}`,
            },
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          sx={{
            color: sage,
            borderColor: sage,
            fontWeight: "bold",
            fontSize: 16,
            py: 1.5,
            "&:hover": {
              backgroundColor: sage,
              color: "#000",
              borderColor: sage,
            },
          }}
          onClick={() => router.push("/auth/register")}
        >
          Don't have an account? Register
        </Button>

        {message && (
          <Typography sx={{ mt: 2, color: sage, textAlign: "center", fontWeight: 500 }}>
            {message}
          </Typography>
        )}
      </Paper>

      <style>
        {`
          @keyframes pulse {
            0% { transform: rotate(0deg) scale(1); }
            100% { transform: rotate(360deg) scale(1.2); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoginPage;