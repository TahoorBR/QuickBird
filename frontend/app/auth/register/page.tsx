"use client";

import { useState } from "react";
import { TextField, Button, Typography, Box, Paper, Container, Grid, Avatar, alpha } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { FlashOn, ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/use-auth";
import { useTheme } from "../../../contexts/ThemeContext";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const { register, loading } = useAuth();
  const { mode, theme } = useTheme();
  const sage = theme.palette.primary.main;

  const handleRegister = async () => {
    setMessage("");
    try {
      await register(email, password, username, fullName);
      setMessage("User registered successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setMessage(err.message || "Registration failed!");
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
          {/* Left Side - Registration Form */}
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
                <HowToRegIcon sx={{ fontSize: 60, color: sage, mb: 2 }} />
                <Typography variant="h4" sx={{ color: mode === 'dark' ? "#fff" : "#000", fontWeight: 700, mb: 1 }}>
                  Create Account
                </Typography>
                <Typography sx={{ color: mode === 'dark' ? "#ccc" : "#666" }}>
                  Join QuickBird and start managing your projects
                </Typography>
              </Box>

              {/* Registration Form */}
              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  sx={{
                    input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
                    label: { color: mode === 'dark' ? '#ccc' : '#666' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": {
                        borderColor: sage,
                        boxShadow: `0 0 12px ${sage}66`,
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                        WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
                      },
                    },
                  }}
                />

                <TextField
                  label="Username"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    input: { color: mode === 'dark' ? '#fff' : '#000', WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset` },
                    label: { color: mode === 'dark' ? '#ccc' : '#666' },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": {
                        borderColor: sage,
                        boxShadow: `0 0 12px ${sage}66`,
                      },
                      "& input:-webkit-autofill": {
                        WebkitBoxShadow: `0 0 0 1000px ${mode === 'dark' ? '#111' : '#fff'} inset`,
                        WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000',
                      },
                    },
                  }}
                />

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
                        boxShadow: `0 0 12px ${sage}66`,
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
                        boxShadow: `0 0 12px ${sage}66`,
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
                  onClick={handleRegister}
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
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => router.push("/auth/login")}
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
                  Already have an account? Sign In
                </Button>

                {message && (
                  <Typography
                    sx={{
                      mt: 2,
                      color: message.includes("successfully") ? sage : "tomato",
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
                minHeight: { xs: "300px", md: "450px" },
                position: "relative",
              }}
            >
              {/* Logo and Branding */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    background: `linear-gradient(45deg, ${sage}, #2196F3)`,
                    boxShadow: `0 6px 24px ${alpha(sage, 0.3)}`,
                  }}
                >
                  <FlashOn sx={{ fontSize: 40, color: "white" }} />
                </Avatar>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${sage}, #2196F3)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  QuickBird
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: mode === 'dark' ? "#ccc" : "#666",
                    fontWeight: 400,
                    mb: 3,
                    maxWidth: "400px",
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  AI-powered tools for freelancers to manage projects, generate proposals, and grow their business.
                </Typography>
              </Box>

              {/* Features List */}
              <Box sx={{ textAlign: "left", maxWidth: "500px" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: mode === 'dark' ? "#fff" : "#000",
                    fontWeight: 600,
                    mb: 2,
                    textAlign: "center",
                  }}
                >
                  What you'll get:
                </Typography>
                
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  {[
                    "🤖 AI proposals",
                    "📊 Smart management",
                    "⏰ Time tracking",
                    "💰 Invoicing",
                    "📈 Analytics",
                    "🔒 Secure"
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1.5,
                        background: alpha(sage, 0.1),
                        border: `1px solid ${alpha(sage, 0.2)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: alpha(sage, 0.15),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color: mode === 'dark' ? "#fff" : "#000",
                          fontWeight: 500,
                          fontSize: "0.9rem",
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

export default RegisterPage;