"use client";

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Container
} from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  Work,
  Assignment,
  People,
  TrendingUp,
  Psychology,
  Security,
  AccessTime,
  Add,
  MoreVert,
  CheckCircle,
  Schedule,
  Warning,
  LightMode,
  DarkMode
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient, Project, Task } from "@/lib/api";
import toast from "react-hot-toast";

// Helper functions for data processing
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'active': return 'In Progress';
    case 'completed': return 'Completed';
    case 'paused': return 'Paused';
    default: return status;
  }
};

const getPriorityDisplay = (priority: string) => {
  switch (priority) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    default: return priority;
  }
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => {
  const theme = useTheme();

  return (
    <Card
        sx={{
        height: "100%",
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 24, color }} />
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              color={trend.startsWith('+') ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const theme = useTheme();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.info.main;
      case 'completed': return theme.palette.success.main;
      case 'paused': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="600">
            {project.title}
          </Typography>
        }
        subheader={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {project.client_name || 'No client'}
            </Typography>
            <Chip
              label={getStatusDisplay(project.status)}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(project.status), 0.1),
                color: getStatusColor(project.status),
                border: `1px solid ${alpha(getStatusColor(project.status), 0.3)}`,
              }}
            />
          </Box>
        }
        action={
          <IconButton>
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description || 'No description'}
        </Typography>

        {project.deadline && (
          <Typography variant="body2" color="text.secondary">
            Due: {new Date(project.deadline).toLocaleDateString()}
          </Typography>
        )}

        {project.budget && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Budget: ${project.budget.toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode, toggleMode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, tasksData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getTasks()
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  if (!mounted || loading || loadingData) {
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
          Please log in to access the dashboard
        </Typography>
        <Button
          component={Link}
          href="/auth/login"
          variant="contained"
          size="large"
        >
          Login
        </Button>
      </Box>
    );
  }

  // Calculate stats from real data
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status !== 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalHours: tasks.reduce((sum, t) => sum + (t.time_tracked || 0), 0)
  };

  return (
    <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
            Welcome back, {user.username}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your projects today.
          </Typography>
        </Box>

          {/* Stats Grid */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                icon={Work}
                color={theme.palette.primary.main}
                subtitle={`${stats.activeProjects} active`}
              />
            </Box>
            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <StatCard
                title="Total Budget"
                value={`$${stats.totalBudget.toLocaleString()}`}
                icon={TrendingUp}
                color={theme.palette.success.main}
                subtitle="Across all projects"
              />
            </Box>
            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <StatCard
                title="Tasks Completed"
                value={stats.completedTasks}
                icon={Assignment}
                color={theme.palette.info.main}
                subtitle={`${stats.pendingTasks} pending`}
              />
            </Box>
            <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
              <StatCard
                title="Hours Tracked"
                value={stats.totalHours}
                icon={AccessTime}
                color={theme.palette.warning.main}
                subtitle="Total time tracked"
              />
            </Box>
          </Box>

          {/* Main Content Grid */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {/* Recent Projects */}
            <Box sx={{ flex: "1 1 600px", minWidth: "600px" }}>
              <Card
          sx={{
                  height: "100%",
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: "blur(10px)",
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="h6" fontWeight="600">
                        Recent Projects
          </Typography>
                      <Button
                        component={Link}
                        href="/dashboard/projects"
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                      >
                        New Project
          </Button>
                    </Box>
                  }
                />
                <CardContent>
                  {projects.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {projects.slice(0, 3).map((project) => (
                        <Box key={project.id} sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                          <ProjectCard project={project} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No projects yet. Create your first project to get started!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Quick Actions & Upcoming Deadlines */}
            <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Quick Actions */}
                <Box>
                  <Card
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <CardHeader title="Quick Actions" />
                    <CardContent>
                      <List>
                        <ListItem disablePadding>
                          <ListItemButton
                            component={Link}
                            href="/dashboard/tools"
                            sx={{ borderRadius: 1, mb: 1 }}
                          >
                            <ListItemIcon>
                              <Psychology color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="AI Tools" secondary="Generate content & proposals" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton
                            component={Link}
                            href="/dashboard/projects"
                            sx={{ borderRadius: 1, mb: 1 }}
                          >
                            <ListItemIcon>
                              <Work color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="New Project" secondary="Start a new project" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton
                            component={Link}
                            href="/dashboard/tasks"
                            sx={{ borderRadius: 1, mb: 1 }}
                          >
                            <ListItemIcon>
                              <Assignment color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Add Task" secondary="Create a new task" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton
                            component={Link}
                            href="/dashboard/users"
                            sx={{ borderRadius: 1 }}
                          >
                            <ListItemIcon>
                              <People color="primary" />
                            </ListItemIcon>
                            <ListItemText primary="Manage Clients" secondary="View client list" />
                          </ListItemButton>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Box>

                {/* Recent Activity */}
                <Box>
                  <Card
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <CardHeader title="Recent Activity" />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Track your project progress and task completion here.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Recent Tasks */}
          <Box sx={{ mt: 3 }}>
            <Box>
              <Card
                sx={{
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: "blur(10px)",
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="h6" fontWeight="600">
                        Recent Tasks
                      </Typography>
                      <Button
                        component={Link}
                        href="/dashboard/tasks"
                        variant="outlined"
                        size="small"
                        startIcon={<Add />}
                      >
            Add Task
          </Button>
                    </Box>
                  }
                />
                <CardContent>
                  {tasks.length > 0 ? (
                    <List>
                      {tasks.slice(0, 5).map((task, index) => (
                        <Box key={task.id}>
                          <ListItem>
                            <ListItemIcon>
                              {task.status === 'completed' ? (
                                <CheckCircle color="success" />
                              ) : (
                                <Schedule color={task.priority === 'high' ? 'error' : 'warning'} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                      opacity: task.status === 'completed' ? 0.6 : 1,
                                    }}
                                  >
                                    {task.title}
                                  </Typography>
                                  <Chip
                                    label={getPriorityDisplay(task.priority)}
                                    size="small"
                                    color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {task.project_id ? `Project #${task.project_id}` : 'No project'} 
                                    {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString()}`}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < Math.min(tasks.length, 5) - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No tasks yet. Create your first task to get started!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
      </Container>
  );
  }