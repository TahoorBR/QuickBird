"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography, Box } from "@mui/material";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)", // dark base
      }}
    >
      {/* Sage green pulse layer */}
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

      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          background: "linear-gradient(90deg, #A8BCA1, #7B9A6D, #A8BCA1)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 20px rgba(123,154,109,0.4)",
          animation:
            "gradientFlow 2.5s ease-in-out infinite, zoomCinematic 3s ease-in-out forwards",
          letterSpacing: "0.05em",
          zIndex: 1,
          "@keyframes gradientFlow": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
          "@keyframes zoomCinematic": {
            "0%": {
              transform: "scale(0.8)",
              opacity: 0,
              letterSpacing: "0.05em",
            },
            "20%": {
              transform: "scale(1)",
              opacity: 1,
              letterSpacing: "0.1em",
            },
            "70%": {
              transform: "scale(1.4)",
              opacity: 1,
              letterSpacing: "0.15em",
            },
            "100%": {
              transform: "scale(8)",
              opacity: 0,
              letterSpacing: "0.2em",
            },
          },
          "@keyframes pulse": {
            "0%": { transform: "rotate(0deg) scale(1)" },
            "100%": { transform: "rotate(360deg) scale(1.2)" },
          },
        }}
      >
        QuickBird
      </Typography>
    </Box>
  );
}
