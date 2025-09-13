'use client'

import { Card, CardContent, Typography, Box, Paper, Button } from '@mui/material'
import { Login, PersonAdd, ArrowBack } from '@mui/icons-material'
import Link from 'next/link'
import { useTheme } from '../../contexts/ThemeContext'

export default function AuthPage() {
  const { mode, theme } = useTheme()
  const sage = theme.palette.primary.main

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
          background: `radial-gradient(circle at center, ${sage}20, transparent 70%)`,
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
          <Typography variant="h3" sx={{ color: mode === 'dark' ? "#fff" : "#000", fontWeight: 700, mb: 2 }}>
            Welcome to QuickBird
          </Typography>
          <Typography sx={{ color: mode === 'dark' ? "#ccc" : "#666", fontSize: 18 }}>
            Choose how you'd like to get started
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Login />}
              sx={{
                backgroundColor: sage,
                color: "#000",
                fontWeight: "bold",
                fontSize: 16,
                py: 1.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#000",
                  color: sage,
                  border: `1px solid ${sage}`,
                },
              }}
            >
              Sign In
            </Button>
          </Link>
          
          <Link href="/auth/register" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonAdd />}
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
              Create Account
            </Button>
          </Link>
          
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Button
                startIcon={<ArrowBack />}
                sx={{
                  color: mode === 'dark' ? "#ccc" : "#666",
                  "&:hover": {
                    color: mode === 'dark' ? "#fff" : "#000",
                    backgroundColor: "transparent",
                  },
                }}
              >
                Back to home
              </Button>
            </Link>
          </Box>
        </Box>
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
  )
}