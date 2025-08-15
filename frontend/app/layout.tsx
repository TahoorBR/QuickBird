"use client";

// frontend/app/layout.tsx
import { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../styles/theme";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
