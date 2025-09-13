"use client";

import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from "@mui/material";
import { 
  ArrowForward, 
  Psychology, 
  People, 
  TrendingUp, 
  Security, 
  AccessTime, 
  Description, 
  FlashOn,
  Dashboard,
  Work,
  Assessment,
  LightMode,
  DarkMode
} from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

const features = [
  {
    icon: Psychology,
    title: "AI-Powered Tools",
    description: "Generate proposals, contracts, and content with advanced AI assistance",
    color: "#4CAF50",
    href: "/dashboard/tools"
  },
  {
    icon: Work,
    title: "Project Management",
    description: "Organize and track your projects with intelligent task management",
    color: "#2196F3",
    href: "/dashboard/projects"
  },
  {
    icon: People,
    title: "Client Management",
    description: "Build and maintain strong relationships with your clients",
    color: "#FF9800",
    href: "/dashboard/users"
  },
  {
    icon: Assessment,
    title: "Analytics & Reports",
    description: "Track your performance and growth with detailed insights",
    color: "#9C27B0",
    href: "/dashboard"
  },
  {
    icon: Security,
    title: "Secure Payments",
    description: "Handle payments and contracts with enterprise-grade security",
    color: "#F44336",
    href: "/dashboard"
  },
  {
    icon: AccessTime,
    title: "Time Tracking",
    description: "Monitor your productivity and billable hours accurately",
    color: "#00BCD4",
    href: "/dashboard/tasks"
  }
];

const stats = [
  { label: "Projects Managed", value: "Unlimited", icon: Work },
  { label: "AI Tools Available", value: "10+", icon: Psychology },
  { label: "Time Tracking", value: "Real-time", icon: AccessTime },
  { label: "Team Collaboration", value: "Seamless", icon: People },
];

const testimonials = [
  {
    name: "Get Started Today",
    role: "Join QuickBird",
    content: "Experience the power of AI-driven project management and watch your productivity soar.",
    avatar: "QB"
  },
  {
    name: "Smart & Simple",
    role: "Easy to Use",
    content: "Intuitive interface designed for professionals who value efficiency and results.",
    avatar: "SS"
  },
  {
    name: "All-in-One",
    role: "Complete Solution",
    content: "Everything you need to manage projects, track time, and collaborate effectively.",
    avatar: "AO"
  }
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode, toggleMode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: mode === 'dark' 
          ? "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        color: theme.palette.text.primary,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FlashOn sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              <Typography variant="h5" fontWeight="bold">
                QuickBird
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              
              {user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={`Welcome, ${user.username}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    component={Link}
                    href="/dashboard"
                    variant="contained"
                    startIcon={<Dashboard />}
                  >
                    Dashboard
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outlined"
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                  >
                    Get Started
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: "center",
              mb: 8,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
              }}
            >
              QuickBird - Smart Project Management
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Streamline your projects with AI-powered tools, smart task management, 
              and intelligent insights to boost your productivity and success.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href={user ? "/dashboard" : "/auth/register"}
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
              
              <Button
                component={Link}
                href="/dashboard/tools"
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Explore AI Tools
              </Button>
            </Box>
          </Box>

          {/* Stats Section */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {stats.map((stat, index) => (
                <Box key={index} sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 3,
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <CardContent>
                      <stat.icon
                        sx={{
                          fontSize: 40,
                          color: theme.palette.primary.main,
                          mb: 2,
                        }}
                      />
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Features Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              textAlign="center"
              sx={{ mb: 6, fontWeight: 700 }}
            >
              Everything You Need to Manage Projects
            </Typography>
            
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ flex: "1 1 350px", minWidth: "350px" }}>
                  <Card
                    component={Link}
                    href={feature.href}
                    sx={{
                      height: "100%",
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          background: alpha(feature.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        <feature.icon
                          sx={{
                            fontSize: 30,
                            color: feature.color,
                          }}
                        />
                      </Box>
                      
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", color: feature.color }}>
                        <Typography variant="body2" fontWeight="500">
                          Learn More
                        </Typography>
                        <ArrowForward sx={{ fontSize: 16, ml: 1 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Testimonials Section */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              textAlign="center"
              sx={{ mb: 6, fontWeight: 700 }}
            >
              What Our Users Say
            </Typography>
            
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {testimonials.map((testimonial, index) => (
                <Box key={index} sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                  <Card
                    sx={{
                      height: "100%",
                      p: 3,
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, fontStyle: "italic", lineHeight: 1.6 }}
                      >
                        "{testimonial.content}"
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              textAlign: "center",
              p: 6,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Ready to Boost Your Productivity?
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Start managing your projects more efficiently with QuickBird
            </Typography>
            
            <Button
              component={Link}
              href={user ? "/dashboard" : "/auth/register"}
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {user ? "Access Dashboard" : "Start Your Free Trial"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FlashOn sx={{ fontSize: 24, color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight="bold">
                QuickBird
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              © 2024 QuickBird. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}