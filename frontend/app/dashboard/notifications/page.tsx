"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Chip,
  IconButton,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Container,
  Fab,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Menu,
  MenuItem
} from "@mui/material";
import { 
  Notifications as NotificationsIcon,
  MarkEmailRead,
  Delete,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Info,
  Schedule,
  Assignment,
  Work,
  Receipt,
  Timeline,
  Payment
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient, Notification } from "@/lib/api";
import toast from "react-hot-toast";

const getNotificationIcon = (type: string, priority: string) => {
  const iconProps = {
    color: priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'primary'
  } as any;

  switch (type) {
    case 'task_due':
      return <Schedule {...iconProps} />;
    case 'task_completed':
      return <CheckCircle {...iconProps} />;
    case 'project_deadline':
      return <Work {...iconProps} />;
    case 'milestone_completed':
      return <Timeline {...iconProps} />;
    case 'invoice_overdue':
      return <Receipt {...iconProps} />;
    case 'payment_received':
      return <Payment {...iconProps} />;
    case 'system_update':
      return <Info {...iconProps} />;
    default:
      return <NotificationsIcon {...iconProps} />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'default';
    default: return 'default';
  }
};

const getTypeDisplay = (type: string) => {
  switch (type) {
    case 'task_due': return 'Task Due';
    case 'task_completed': return 'Task Completed';
    case 'project_deadline': return 'Project Deadline';
    case 'milestone_completed': return 'Milestone Completed';
    case 'invoice_overdue': return 'Invoice Overdue';
    case 'payment_received': return 'Payment Received';
    case 'system_update': return 'System Update';
    case 'general': return 'General';
    default: return type;
  }
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const notificationsData = await apiClient.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await apiClient.markNotificationRead(notification.id);
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await apiClient.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (tabValue) {
      case 0: return !notification.is_read; // Unread
      case 1: return notification.is_read; // Read
      case 2: return notification.priority === 'urgent' || notification.priority === 'high'; // High Priority
      case 3: return notification.type === 'task_due' || notification.type === 'project_deadline'; // Due Soon
      default: return true;
    }
  });

  if (!mounted || loading || loadingNotifications) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <LinearProgress sx={{ width: "100%", maxWidth: 400 }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Please log in to view notifications
        </Typography>
      </Box>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const highPriorityCount = notifications.filter(n => !n.is_read && (n.priority === 'urgent' || n.priority === 'high')).length;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h4" fontWeight="600">
            Notifications
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Stay updated with your projects, tasks, and important updates.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
              <Box>
                <Typography variant="h6">{unreadCount}</Typography>
                <Typography variant="body2" color="text.secondary">Unread</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Warning color="warning" />
              <Box>
                <Typography variant="h6">{highPriorityCount}</Typography>
                <Typography variant="body2" color="text.secondary">High Priority</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <NotificationsIcon color="info" />
              <Box>
                <Typography variant="h6">{notifications.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label={`Read (${notifications.length - unreadCount})`} />
          <Tab label={`High Priority (${highPriorityCount})`} />
          <Tab label="Due Soon" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredNotifications.length > 0 ? (
            <List>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type, notification.priority)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={notification.is_read ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={getTypeDisplay(notification.type)}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                            variant="outlined"
                          />
                          {!notification.is_read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.primary.main
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, notification)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 ? "You're all caught up! No unread notifications." : 
                 tabValue === 1 ? "No read notifications to show." :
                 tabValue === 2 ? "No high priority notifications." :
                 "No due soon notifications."}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.is_read && (
          <MenuItem onClick={() => {
            handleMarkAsRead(selectedNotification);
            handleMenuClose();
          }}>
            <MarkEmailRead sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => {
            if (selectedNotification) {
              handleDeleteNotification(selectedNotification.id);
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}
