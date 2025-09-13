"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Grid,
  useTheme,
  alpha,
  Container,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import { 
  TrendingUp,
  Schedule,
  AttachMoney,
  Work,
  Assignment,
  People,
  Receipt,
  Timeline,
  Download,
  Refresh,
  MoreVert,
  CheckCircle,
  Pending,
  Error,
  TrendingDown
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient, Project, Task, Client, Invoice, WorkLog } from "@/lib/api";
import toast from "react-hot-toast";

interface AnalyticsData {
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  timeTracking: {
    totalHours: number;
    billableHours: number;
    thisWeek: number;
    lastWeek: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    pending: number;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  productivity: {
    tasksCompleted: number;
    avgTaskTime: number;
    efficiency: number;
  };
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      
      // Load all data
      const [projects, tasks, clients, invoices, workLogs] = await Promise.all([
        apiClient.getProjects().catch(() => []),
        apiClient.getTasks().catch(() => []),
        apiClient.getClients().catch(() => []),
        apiClient.getInvoices().catch(() => []),
        apiClient.getWorkLogs().catch(() => [])
      ]);

      // Calculate analytics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const overdueProjects = projects.filter(p => p.deadline && new Date(p.deadline) < now && p.status !== 'completed').length;

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length;

      const totalHours = workLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
      const billableHours = workLogs.filter(log => log.is_billable).reduce((sum, log) => sum + (log.hours_worked || 0), 0);
      
      const thisWeekLogs = workLogs.filter(log => {
        const logDate = new Date(log.created_at);
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return logDate >= weekAgo;
      });
      const thisWeekHours = thisWeekLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

      const lastWeekLogs = workLogs.filter(log => {
        const logDate = new Date(log.created_at);
        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return logDate >= twoWeeksAgo && logDate < weekAgo;
      });
      const lastWeekHours = lastWeekLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

      const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
      const thisMonthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= thisMonth;
      });
      const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

      const lastMonthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= lastMonth && invoiceDate < thisMonth;
      });
      const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

      const pendingInvoices = invoices.filter(invoice => invoice.status === 'draft' || invoice.status === 'sent').reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

      const activeClients = clients.filter(c => c.is_active).length;
      const newClientsThisMonth = clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate >= thisMonth;
      }).length;

      const avgTaskTime = completedTasks > 0 ? totalHours / completedTasks : 0;
      const efficiency = completedTasks > 0 ? (completedTasks / (completedTasks + pendingTasks)) * 100 : 0;

      setAnalyticsData({
        projects: {
          total: projects.length,
          active: activeProjects,
          completed: completedProjects,
          overdue: overdueProjects
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks
        },
        timeTracking: {
          totalHours,
          billableHours,
          thisWeek: thisWeekHours,
          lastWeek: lastWeekHours
        },
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          pending: pendingInvoices
        },
        clients: {
          total: clients.length,
          active: activeClients,
          newThisMonth: newClientsThisMonth
        },
        productivity: {
          tasksCompleted: completedTasks,
          avgTaskTime,
          efficiency
        }
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = () => {
    // In real app, this would export data to CSV/Excel
    toast.success('Data export started');
    handleMenuClose();
  };

  const handleRefresh = () => {
    loadAnalytics();
    handleMenuClose();
  };

  if (!mounted || loading || loadingAnalytics) {
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
          Please log in to view analytics
        </Typography>
      </Box>
    );
  }

  if (!analyticsData) {
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
          No analytics data available
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h4" fontWeight="600">
            Analytics Dashboard
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleRefresh}>
                <Refresh sx={{ mr: 1 }} />
                Refresh Data
              </MenuItem>
              <MenuItem onClick={handleExportData}>
                <Download sx={{ mr: 1 }} />
                Export Data
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Track your productivity, revenue, and project performance.
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: 3, 
        mb: 4 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="600" color="primary">
                  {analyticsData.projects.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Projects
                </Typography>
              </Box>
              <Work color="primary" sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Chip label={`${analyticsData.projects.active} Active`} size="small" color="primary" />
              <Chip label={`${analyticsData.projects.completed} Completed`} size="small" color="success" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="600" color="success.main">
                  {analyticsData.tasks.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Completed
                </Typography>
              </Box>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Chip label={`${analyticsData.tasks.pending} Pending`} size="small" color="warning" />
              {analyticsData.tasks.overdue > 0 && (
                <Chip label={`${analyticsData.tasks.overdue} Overdue`} size="small" color="error" />
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="600" color="info.main">
                  {analyticsData.timeTracking.totalHours.toFixed(1)}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
              </Box>
              <Schedule color="info" sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Chip label={`${analyticsData.timeTracking.billableHours.toFixed(1)}h Billable`} size="small" color="info" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="600" color="success.main">
                  PKR {analyticsData.revenue.total.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <AttachMoney color="success" sx={{ fontSize: 40 }} />
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Chip label={`PKR ${analyticsData.revenue.thisMonth.toLocaleString()} This Month`} size="small" color="success" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Detailed Analytics */}
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: 3 
      }}>
        {/* Project Analytics */}
        <Card>
          <CardHeader
            title="Project Performance"
            avatar={<Work />}
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Work color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Active Projects"
                  secondary={`${analyticsData.projects.active} out of ${analyticsData.projects.total}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Completed Projects"
                  secondary={`${analyticsData.projects.completed} projects`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Error color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Overdue Projects"
                  secondary={`${analyticsData.projects.overdue} projects`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Time Tracking Analytics */}
        <Card>
          <CardHeader
            title="Time Tracking"
            avatar={<Schedule />}
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Schedule color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="This Week"
                  secondary={`${analyticsData.timeTracking.thisWeek.toFixed(1)} hours`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Schedule color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Last Week"
                  secondary={`${analyticsData.timeTracking.lastWeek.toFixed(1)} hours`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AttachMoney color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Billable Hours"
                  secondary={`${analyticsData.timeTracking.billableHours.toFixed(1)} hours`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card>
          <CardHeader
            title="Revenue Analysis"
            avatar={<AttachMoney />}
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="This Month"
                  secondary={`PKR ${analyticsData.revenue.thisMonth.toLocaleString()}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Last Month"
                  secondary={`PKR ${analyticsData.revenue.lastMonth.toLocaleString()}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Pending color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Pending Invoices"
                  secondary={`PKR ${analyticsData.revenue.pending.toLocaleString()}`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Productivity Analytics */}
        <Card>
          <CardHeader
            title="Productivity Metrics"
            avatar={<TrendingUp />}
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Assignment color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Task Completion Rate"
                  secondary={`${analyticsData.productivity.efficiency.toFixed(1)}%`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Schedule color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Avg Time per Task"
                  secondary={`${analyticsData.productivity.avgTaskTime.toFixed(1)} hours`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <People color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Active Clients"
                  secondary={`${analyticsData.clients.active} clients`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
