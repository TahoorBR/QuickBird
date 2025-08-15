"use client";

import { AppBar, Toolbar, Typography, Box, IconButton, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
    >
      <Toolbar>
        <IconButton edge="start" color="inherit">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          QuickBird
        </Typography>
        <Box>
          <Avatar alt="User" src="/assets/avatar.png" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
