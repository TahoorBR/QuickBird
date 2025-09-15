"use client";

import { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Container, Grid, Avatar, alpha } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { FlashOn, ArrowBack } from "@mui/icons-material";
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
        position: "relative",
        overflow: "hidden",
        background: mode === 'dark' 
          ? "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)" 
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Background Animation */}
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `radial-gradient(circle at center, ${sage}20, transparent 70%)`,
          animation: "pulse 20s infinite alternate",
          zIndex: 0,
        }}
      />

      {/* Main Content Container */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
        <Grid container sx={{ minHeight: "100vh", alignItems: "center" }}>
          {/* Left Side - Login Form */}
          <Grid item xs={12} md={6} sx={{ pr: { md: 4 } }}>
            <Paper
              sx={{
                p: 6,
                borderRadius: 4,
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
              {/* Back Button */}
              <Box sx={{ mb: 3 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => router.push("/auth")}
                  sx={{
                    color: mode === 'dark' ? "#ccc" : "#666",
                    "&:hover": {
                      color: mode === 'dark' ? "#fff" : "#000",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Back to Auth
                </Button>
              </Box>

              {/* Form Header */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <LoginIcon sx={{ fontSize: 60, color: sage, mb: 2 }} />
                <Typography variant="h4" sx={{ color: mode === 'dark' ? "#fff" : "#000", fontWeight: 700, mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography sx={{ color: mode === 'dark' ? "#ccc" : "#666" }}>
                  Sign in to your QuickBird account
                </Typography>
              </Box>

              {/* Login Form */}
              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
                    label: { color: mode === 'dark' ? '#ccc' : '#666' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { 
                        borderColor: sage, 
                        boxShadow: `0 0 12px ${sage}66` 
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                        WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
                      },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
                    label: { color: mode === 'dark' ? '#ccc' : '#666' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { 
                        borderColor: sage, 
                        boxShadow: `0 0 12px ${sage}66` 
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                        WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
                      },
                    },
                  }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    backgroundColor: sage,
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 16,
                    py: 1.5,
                    mt: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#000",
                      color: sage,
                      border: `1px solid ${sage}`,
                    },
                    "&:disabled": {
                      backgroundColor: alpha(sage, 0.5),
                      color: "#666",
                    },
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => router.push("/auth/register")}
                  sx={{
                    color: sage,
                    borderColor: sage,
                    fontWeight: "bold",
                    fontSize: 16,
                    py: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: sage,
                      color: "#000",
                      borderColor: sage,
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Button>

                {message && (
                  <Typography
                    sx={{
                      mt: 2,
                      color: message.includes("successful") ? sage : "tomato",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    {message}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - QuickBird Branding */}
          <Grid item xs={12} md={6} sx={{ pl: { md: 4 }, mt: { xs: 4, md: 0 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "100%",
                minHeight: { xs: "400px", md: "600px" },
                position: "relative",
              }}
            >
              {/* Logo and Branding */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 3,
                    background: `linear-gradient(45deg, ${sage}, #2196F3)`,
                    boxShadow: `0 8px 32px ${alpha(sage, 0.3)}`,
                  }}
                >
                  <FlashOn sx={{ fontSize: 60, color: "white" }} />
                </Avatar>
                
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: `linear-gradient(45deg, ${sage}, #2196F3)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  QuickBird
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    color: mode === 'dark' ? "#ccc" : "#666",
                    fontWeight: 400,
                    mb: 4,
                    maxWidth: "400px",
                    lineHeight: 1.6,
                  }}
                >
                  AI-powered tools for freelancers to manage projects, generate proposals, and grow their business.
                </Typography>
              </Box>

              {/* Features List */}
              <Box sx={{ textAlign: "left", maxWidth: "400px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: mode === 'dark' ? "#fff" : "#000",
                    fontWeight: 600,
                    mb: 3,
                    textAlign: "center",
                  }}
                >
                  Welcome back! Here's what's waiting for you:
                </Typography>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    "🚀 Continue your projects",
                    "📊 View your analytics",
                    "🤖 Use AI tools",
                    "💰 Manage invoices",
                    "⏰ Track your time",
                    "📈 Monitor progress"
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(sage, 0.1),
                        border: `1px solid ${alpha(sage, 0.2)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: alpha(sage, 0.15),
                          transform: "translateX(8px)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color: mode === 'dark' ? "#fff" : "#000",
                          fontWeight: 500,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

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