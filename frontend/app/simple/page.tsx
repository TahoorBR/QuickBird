"use client";

import { Box, Typography, Button } from "@mui/material";
import { FlashOn } from "@mui/icons-material";

export default function SimplePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <FlashOn sx={{ fontSize: 60, color: "#889977" }} />
      <Typography variant="h2" sx={{ color: "#889977" }}>
        Material-UI is Working!
      </Typography>
      <Typography variant="h6" sx={{ color: "#ccc" }}>
        This page uses Material-UI components successfully
      </Typography>
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#889977",
          color: "#000",
          "&:hover": {
            backgroundColor: "#6d7a5f",
          },
        }}
      >
        Test Button
      </Button>
    </Box>
  );
}
