"use client";

import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link as MuiLink,
  useTheme,
  alpha,
  Badge,
  Tooltip
} from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  Work,
  Assignment,
  People,
  Settings,
  Psychology,
  Receipt,
  Timeline,
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  LightMode,
  DarkMode,
  Home,
  ChevronRight
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";

const drawerWidth = 280;

const getNavigationItems = (counts: any) => [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    badge: null
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: Work,
    badge: counts.projects || 0
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: Assignment,
    badge: counts.tasks || 0
  },
  {
    title: "Milestones",
    href: "/dashboard/milestones",
    icon: Timeline,
    badge: counts.milestones || 0
  },
  {
    title: "AI Tools",
    href: "/dashboard/tools",
    icon: Psychology,
    badge: null
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Notifications,
    badge: counts.notifications || 0
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: Receipt,
    badge: counts.invoices || 0
  },
  {
    title: "Clients",
    href: "/dashboard/users",
    icon: People,
    badge: counts.clients || 0
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    badge: null
  }
];

const BreadcrumbItem = ({ href, children, isLast }: any) => {
  if (isLast) {
    return (
      <Typography color="text.primary" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    );
  }
  
  return (
    <MuiLink
      component={Link}
      href={href}
      underline="hover"
      color="text.secondary"
      sx={{ textDecoration: "none" }}
    >
          {children}
    </MuiLink>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { mode, toggleMode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [counts, setCounts] = useState({ projects: 0, tasks: 0, clients: 0, invoices: 0, milestones: 0, notifications: 0 });
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      if (user) {
        try {
          const [projects, tasks, clients, invoices, milestones, notificationStats] = await Promise.all([
            apiClient.getProjects().catch(() => []),
            apiClient.getTasks().catch(() => []),
            apiClient.getClients().catch(() => []),
            apiClient.getInvoices().catch(() => []),
            apiClient.getMilestones().catch(() => []),
            apiClient.getNotificationStats().catch(() => ({ unread_notifications: 0 }))
          ]);
          
          setCounts({
            projects: projects?.length || 0,
            tasks: tasks?.length || 0,
            clients: clients?.length || 0,
            invoices: invoices?.length || 0,
            milestones: milestones?.length || 0,
            notifications: notificationStats?.unread_notifications || 0
          });
        } catch (error) {
          console.error("Error fetching counts:", error);
        }
      }
    };

    fetchCounts();
  }, [user]);

  if (!mounted) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: "Home", href: "/" }
    ];

    if (pathSegments[0] === 'dashboard') {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
      
      if (pathSegments[1]) {
        const section = getNavigationItems(counts).find(item => 
          item.href === `/dashboard/${pathSegments[1]}`
        );
        if (section) {
          breadcrumbs.push({ 
            label: section.title, 
            href: section.href 
          });
        }
      }
    }

    return breadcrumbs;
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="white">
              QB
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              QuickBird
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Professional Suite
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ px: 2, py: 1 }}>
          {getNavigationItems(counts).map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                    border: isActive 
                      ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? theme.palette.primary.main : "text.secondary",
                      minWidth: 40,
                    }}
                  >
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? theme.palette.primary.main : "text.primary",
                      },
                    }}
                  />
                  {item.badge && (
                    <Badge
                      badgeContent={item.badge}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          height: 20,
                          minWidth: 20,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            cursor: "pointer",
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="600" noWrap>
              {user?.username || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email || "user@example.com"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flex: 1 }}>
            <Breadcrumbs
              separator={<ChevronRight fontSize="small" />}
              aria-label="breadcrumb"
            >
              {getBreadcrumbs().map((breadcrumb, index) => (
                <BreadcrumbItem
                  key={breadcrumb.href}
                  href={breadcrumb.href}
                  isLast={index === getBreadcrumbs().length - 1}
                >
                  {breadcrumb.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumbs>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Toggle theme">
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem component={Link} href="/dashboard/profile" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem component={Link} href="/dashboard/settings" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(10px)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(10px)",
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: mode === 'dark' 
            ? "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}