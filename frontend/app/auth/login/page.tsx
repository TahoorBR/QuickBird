"use client";

import { useState } from "react";
import { supabase } from "../../../supabase_client";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import bcrypt from "bcryptjs";
import LoginIcon from "@mui/icons-material/Login";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sage = "#889977";

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setMessage("User not found");
      } else {
        const isValid = bcrypt.compareSync(password, data.hashed_password);
        if (!isValid) {
          setMessage("Incorrect password");
        } else {
          // ✅ Login successful, set session flag
          localStorage.setItem("authUser", JSON.stringify({ email: data.email }));
          setMessage("Login successful!");

          // Redirect immediately
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong!");
    }
    setLoading(false);
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
        background: "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)",
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
            "radial-gradient(circle at center, rgba(136,153,119,0.08), transparent 70%)",
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
          background: "rgba(17,17,17,0.55)",
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
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            QuickBird Login
          </Typography>
          <Typography sx={{ color: "#ccc", mt: 1 }}>
            Login to manage your projects
          </Typography>
        </Box>

        <TextField
          label="Email"
          fullWidth
          sx={{
            mb: 3,
            input: { color: "#fff", WebkitBoxShadow: "0 0 0 1000px #111 inset" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px #111 inset",
                WebkitTextFillColor: "#fff",
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
            mb: 1, // smaller margin now
            input: { color: "#fff", WebkitBoxShadow: "0 0 0 1000px #111 inset" },
            label: { color: "#ccc" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px #111 inset",
                WebkitTextFillColor: "#fff",
              },
            },
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Typography
          sx={{
            mt: 0.5,
            mb: 3,
            color: sage,
            textDecoration: "underline",
            fontSize: 14,
            cursor: "pointer",
            textAlign: "right",
          }}
          onClick={() => router.push("/auth/forgot")} // your forgot password page
        >
          Forgot password?
        </Typography>


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
