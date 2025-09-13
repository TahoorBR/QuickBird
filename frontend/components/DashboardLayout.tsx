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
  Tooltip,
  Button
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
  ChevronRight,
  Analytics
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiClient } from "@/lib/api";

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

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
    href: "/dashboard/ai-tools",
    icon: Psychology,
    badge: null
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: Analytics,
    badge: null
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
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
          p: sidebarCollapsed ? 2 : 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: sidebarCollapsed ? 0 : 2 }}>
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
          {!sidebarCollapsed && (
            <Box>
              <Typography variant="h6" fontWeight="bold">
                QuickBird
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Professional Suite
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ px: sidebarCollapsed ? 1 : 2, py: 1 }}>
          {getNavigationItems(counts).map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={sidebarCollapsed ? item.title : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      px: sidebarCollapsed ? 1.5 : 2,
                      justifyContent: sidebarCollapsed ? "center" : "flex-start",
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
                        minWidth: sidebarCollapsed ? "auto" : 40,
                        justifyContent: "center",
                      }}
                    >
                      {item.badge && !sidebarCollapsed ? (
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
                        >
                          <item.icon />
                        </Badge>
                      ) : (
                        <item.icon />
                      )}
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                      <ListItemText
                        primary={item.title}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? theme.palette.primary.main : "text.primary",
                          },
                        }}
                      />
                    )}
                    {item.badge && sidebarCollapsed && (
                      <Badge
                        badgeContent={item.badge}
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          "& .MuiBadge-badge": {
                            fontSize: "0.75rem",
                            height: 16,
                            minWidth: 16,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1 : 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: sidebarCollapsed ? 0 : 2,
            p: sidebarCollapsed ? 1 : 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            cursor: "pointer",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
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
          {!sidebarCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight="600" noWrap>
                {user?.username || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email || "user@example.com"}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Toggle Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <IconButton
            onClick={handleSidebarToggle}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <MenuIcon sx={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          </IconButton>
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
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px` },
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: "none",
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
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
              <IconButton 
                onClick={toggleMode} 
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton 
                onClick={handleNotificationMenuOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Badge badgeContent={counts.notifications} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.notifications} unread notifications
          </Typography>
        </Box>
        
        {counts.notifications > 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              You have {counts.notifications} unread notifications
            </Typography>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mt: 2 }}
              component={Link}
              href="/dashboard/notifications"
              onClick={handleNotificationMenuClose}
            >
              View All Notifications
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        )}
      </Menu>

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
        sx={{ 
          width: { sm: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
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
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(10px)",
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
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
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: mode === 'dark' 
            ? "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}