import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#556B2F" }, // Olive green
    secondary: { main: "#FFFFFF" },
    background: { default: "#000000", paper: "rgba(0,0,0,0.6)" },
    text: { primary: "#FFFFFF", secondary: "#CCCCCC" },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
});

export default theme;
