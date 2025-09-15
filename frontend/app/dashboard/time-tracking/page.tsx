"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Fab,
  Tooltip,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from "@mui/material";
import { 
  PlayArrow,
  Stop,
  Pause,
  Add,
  Edit,
  Delete,
  Schedule,
  Timer,
  Work,
  Assignment,
  Person,
  TrendingUp,
  AccessTime,
  PlayCircleOutline,
  StopCircleOutline
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { apiClient, Project, Task } from "@/lib/api";
import toast from "react-hot-toast";

interface TimeEntry {
  id: number;
  project_id: number;
  task_id?: number;
  description: string;
  start_time: string;
  end_time?: string;
  hours_worked: number;
  is_billable: boolean;
  is_active: boolean;
  project?: Project;
  task?: Task;
}

interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  currentTime: Date;
  elapsed: number;
}

export default function TimeTrackingPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  
  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  
  // UI State
  const [loadingData, setLoadingData] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    currentTime: new Date(),
    elapsed: 0
  });
  
  // Form Data
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    description: '',
    is_billable: true
  });

  useEffect(() => {
    setMounted(true);
    loadData();
    
    // Update timer every second
    const timer = setInterval(() => {
      setTimerState(prev => ({
        ...prev,
        currentTime: new Date(),
        elapsed: prev.isRunning && prev.startTime 
          ? Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000)
          : 0
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, tasksData] = await Promise.all([
        apiClient.getProjects().catch(() => []),
        apiClient.getTasks().catch(() => [])
      ]);
      
      setProjects(projectsData);
      setTasks(tasksData);
      
      // Load active timer
      await loadActiveTimer();
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const loadActiveTimer = async () => {
    try {
      const response = await apiClient.getActiveTimer();
      if (response) {
        setActiveTimer(response);
        setTimerState(prev => ({
          ...prev,
          isRunning: true,
          startTime: new Date(response.start_time)
        }));
      }
    } catch (error) {
      console.error('Failed to load active timer:', error);
    }
  };

  const startTimer = async () => {
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }
    
    try {
      const response = await apiClient.startTimer(
        parseInt(formData.project_id),
        formData.task_id ? parseInt(formData.task_id) : undefined,
        formData.description,
        formData.is_billable
      );
      
      setActiveTimer({
        id: response.work_log_id,
        project_id: parseInt(formData.project_id),
        task_id: formData.task_id ? parseInt(formData.task_id) : undefined,
        description: formData.description,
        start_time: response.start_time,
        hours_worked: 0,
        is_billable: formData.is_billable,
        is_active: true
      });
      
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        startTime: new Date(response.start_time),
        elapsed: 0
      }));
      
      setFormData({
        project_id: '',
        task_id: '',
        description: '',
        is_billable: true
      });
      
      toast.success('Timer started');
    } catch (error) {
      console.error('Failed to start timer:', error);
      toast.error('Failed to start timer');
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    
    try {
      await apiClient.stopTimer(activeTimer.id);
      
      setActiveTimer(null);
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        startTime: null,
        elapsed: 0
      }));
      
      toast.success('Timer stopped');
      loadData(); // Reload data to get updated time entries
    } catch (error) {
      console.error('Failed to stop timer:', error);
      toast.error('Failed to stop timer');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
  };

  const getTaskName = (taskId?: number) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
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
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h6">Please log in to access time tracking</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Time Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your time and manage work logs
        </Typography>
      </Box>

      {/* Active Timer */}
      {activeTimer && (
        <Card sx={{ mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  Timer Running
                </Typography>
                <Typography variant="body1">
                  <strong>Project:</strong> {getProjectName(activeTimer.project_id)}
                </Typography>
                {activeTimer.task_id && (
                  <Typography variant="body1">
                    <strong>Task:</strong> {getTaskName(activeTimer.task_id)}
                  </Typography>
                )}
                <Typography variant="body1">
                  <strong>Description:</strong> {activeTimer.description || 'No description'}
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mt: 2 }}>
                  {formatTime(timerState.elapsed)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<StopCircleOutline />}
                onClick={stopTimer}
                sx={{ minWidth: 120 }}
              >
                Stop Timer
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Timer Controls */}
      {!activeTimer && (
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Start New Timer" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    value={formData.project_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                    label="Project"
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Task (Optional)</InputLabel>
                  <Select
                    value={formData.task_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, task_id: e.target.value }))}
                    label="Task (Optional)"
                  >
                    <MenuItem value="">No Task</MenuItem>
                    {tasks
                      .filter(task => task.project_id === parseInt(formData.project_id))
                      .map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                          {task.title}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What are you working on?"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl>
                    <InputLabel>Billable</InputLabel>
                    <Select
                      value={formData.is_billable}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_billable: e.target.value as boolean }))}
                      label="Billable"
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={startTimer}
                    disabled={!formData.project_id}
                    sx={{ minWidth: 150 }}
                  >
                    Start Timer
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recent Time Entries */}
      <Card>
        <CardHeader title="Recent Time Entries" />
        <CardContent>
          {timeEntries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccessTime sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No time entries yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a timer to begin tracking your time
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Billable</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{getProjectName(entry.project_id)}</TableCell>
                      <TableCell>{getTaskName(entry.task_id) || '-'}</TableCell>
                      <TableCell>{entry.description || '-'}</TableCell>
                      <TableCell>{entry.hours_worked.toFixed(2)}h</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.is_billable ? 'Yes' : 'No'}
                          color={entry.is_billable ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(entry.start_time).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowCreateDialog(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
}
