'use client'

import { useState } from 'react'
import { TextField, Button, Typography, Box, Paper } from '@mui/material'
import { ArrowBack, Mail } from '@mui/icons-material'
import Link from 'next/link'
import { useTheme } from '../../../contexts/ThemeContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { mode, theme } = useTheme()
  const sage = theme.palette.primary.main

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Implement password reset functionality
    setTimeout(() => {
      setMessage('Password reset email sent! Check your inbox.')
      setLoading(false)
    }, 2000)
  }

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
          <Mail sx={{ fontSize: 60, color: sage, mb: 1 }} />
          <Typography variant="h4" sx={{ color: mode === 'dark' ? "#fff" : "#000", fontWeight: 700 }}>
            Reset Password
          </Typography>
          <Typography sx={{ color: mode === 'dark' ? "#ccc" : "#666", mt: 1 }}>
            Enter your email address and we'll send you a reset link
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            sx={{
              mb: 3,
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
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
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Box>
        
        {message && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: `${sage}20`,
              border: `1px solid ${sage}55`,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: sage, fontSize: 14 }}>
              {message}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link href="/auth/login" style={{ color: sage, textDecoration: "none" }}>
            <Typography sx={{ color: sage, "&:hover": { color: `${sage}cc` } }}>
              Back to Sign In
            </Typography>
          </Link>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link href="/" style={{ color: mode === 'dark' ? "#ccc" : "#666", textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <ArrowBack sx={{ fontSize: 16 }} />
              <Typography sx={{ "&:hover": { color: mode === 'dark' ? "#fff" : "#000" } }}>
                Back to home
              </Typography>
            </Box>
          </Link>
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