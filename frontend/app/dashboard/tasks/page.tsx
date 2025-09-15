"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Grid,
  Chip,
  IconButton,
  useTheme,
  alpha,
  TextField,
  Fab,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Assignment as TaskIcon,
  Add,
  Search,
  FilterList,
  CheckCircle,
  Schedule,
  Person,
  Edit,
  Delete,
  AccessTime,
  PlayArrow,
  Pause,
  Stop,
  AutoAwesome,
  ContentCopy,
  Download,
  Psychology,
  Timeline
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Link from "next/link";
import { apiClient, Task, WorkLog } from "@/lib/api";
import toast from "react-hot-toast";

// Task status mapping
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
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

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete, onLogWork, onAiGenerate, aiGenerating }: { 
  task: Task; 
  onToggleComplete: (id: number) => void; 
  onEdit: (task: Task) => void; 
  onDelete: (id: number) => void; 
  onLogWork: (task: Task) => void;
  onAiGenerate: (task: Task, action: "description" | "breakdown" | "optimization") => void;
  aiGenerating: number | null;
}) => {
  const theme = useTheme();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <ListItem
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        borderRadius: 2,
        mb: 1,
        border: isOverdue ? `1px solid ${theme.palette.error.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        opacity: task.status === 'completed' ? 0.7 : 1,
      }}
    >
      <ListItemIcon>
        <Checkbox
          checked={task.status === 'completed'}
          onChange={() => onToggleComplete(task.id)}
          color="primary"
        />
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                fontWeight: task.status === 'completed' ? 400 : 600,
              }}
            >
              {task.title}
            </Typography>
            <Chip
              label={getPriorityDisplay(task.priority)}
              size="small"
              sx={{
                backgroundColor: alpha(getPriorityColor(task.priority), 0.1),
                color: getPriorityColor(task.priority),
                border: `1px solid ${alpha(getPriorityColor(task.priority), 0.3)}`,
                fontSize: "0.75rem",
              }}
            />
            {isOverdue && (
              <Chip
                label="Overdue"
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {task.description || 'No description'}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {task.due_date && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              {task.time_tracked > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {task.time_tracked}h tracked
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="primary">
                {task.project_id ? `Project #${task.project_id}` : 'No project'}
              </Typography>
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={() => onAiGenerate(task, "description")} 
            color="primary"
            disabled={aiGenerating === task.id}
            title="AI Description"
          >
            <AutoAwesome />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onAiGenerate(task, "breakdown")} 
            color="secondary"
            disabled={aiGenerating === task.id}
            title="AI Breakdown"
          >
            <Timeline />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onAiGenerate(task, "optimization")} 
            color="info"
            disabled={aiGenerating === task.id}
            title="AI Optimization"
          >
            <Psychology />
          </IconButton>
          <IconButton size="small" onClick={() => onLogWork(task)} title="Log Work">
            <AccessTime />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(task)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(task.id)} color="error">
            <Delete />
          </IconButton>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default function TasksPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showWorkLogDialog, setShowWorkLogDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiAction, setAiAction] = useState<"description" | "breakdown" | "optimization" | null>(null);

  useEffect(() => {
    setMounted(true);
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const tasksData = await apiClient.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await apiClient.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      setShowCreateDialog(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await apiClient.updateTask(taskId, { status: newStatus });
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        ));
        toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleEdit = async (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    
    try {
      const updatedTask = await apiClient.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      setShowEditDialog(false);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleLogWork = (task: Task) => {
    setSelectedTask(task);
    setShowWorkLogDialog(true);
    // Load existing work logs for this task
    loadWorkLogs(task.id);
  };

  const loadWorkLogs = async (taskId: number) => {
    try {
      const workLogsData = await apiClient.getWorkLogs(taskId);
      setWorkLogs(workLogsData);
    } catch (error) {
      console.error('Failed to load work logs:', error);
      setWorkLogs([]);
    }
  };

  const handleCreateWorkLog = async (workLogData: Omit<WorkLog, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLog = await apiClient.createWorkLog(workLogData);
      setWorkLogs(prev => [...prev, newLog]);
      
      // Update task time_tracked
      if (selectedTask) {
        const totalHours = workLogs.reduce((sum, log) => sum + log.hours_worked, 0) + workLogData.hours_worked;
        await apiClient.updateTask(selectedTask.id, { time_tracked: totalHours });
        setTasks(prev => prev.map(t => 
          t.id === selectedTask.id ? { ...t, time_tracked: totalHours } : t
        ));
      }
      
      toast.success('Work logged successfully');
    } catch (error) {
      console.error('Failed to create work log:', error);
      toast.error('Failed to create work log');
    }
  };

  const handleGenerateExplanation = async (workLog: WorkLog) => {
    try {
      setIsGeneratingExplanation(true);
      const response = await apiClient.generateAIContent({
        tool: "time_tracker_summary",
        prompt: `Generate a professional explanation for this work: ${workLog.description}`,
        parameters: {},
        context: `Task: ${selectedTask?.title}, Hours: ${workLog.hours_worked}`
      });
      
      setWorkLogs(prev => prev.map(log => 
        log.id === workLog.id ? { ...log, ai_explanation: response.result } : log
      ));
      toast.success('AI explanation generated');
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      toast.error('Failed to generate explanation');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const handleAiGenerate = async (task: Task, action: "description" | "breakdown" | "optimization") => {
    setAiGenerating(task.id);
    setAiAction(action);
    
    try {
      let tool, prompt;
      
      switch (action) {
        case "description":
          tool = "task_description";
          prompt = `Generate a detailed task description for: ${task.title}. Current description: ${task.description || 'None'}. Priority: ${task.priority}. Due date: ${task.due_date || 'Not specified'}.`;
          break;
        case "breakdown":
          tool = "task_planner";
          prompt = `Break down this task into smaller subtasks: ${task.title}. Description: ${task.description || 'None'}. Priority: ${task.priority}. Time tracked: ${task.time_tracked || 0} seconds.`;
          break;
        case "optimization":
          tool = "task_optimization";
          prompt = `Provide optimization suggestions for this task: ${task.title}. Description: ${task.description || 'None'}. Priority: ${task.priority}. Status: ${task.status}. Time tracked: ${task.time_tracked || 0} seconds.`;
          break;
      }

      const result = await apiClient.generateAIContent({
        tool,
        prompt,
        parameters: {
          task_title: task.title,
          task_description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.due_date,
          time_tracked: task.time_tracked
        }
      });

      setAiResult(result.result);
      setShowAiDialog(true);
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate AI content');
    } finally {
      setAiGenerating(null);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(aiResult);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadResult = () => {
    const blob = new Blob([aiResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${aiAction}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  if (!mounted || loading || loadingTasks) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
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
          Please log in to view tasks
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "All" || 
                         (filterStatus === "Completed" && task.status === 'completed') ||
                         (filterStatus === "Pending" && task.status !== 'completed');
    
    const matchesPriority = filterPriority === "All" || getPriorityDisplay(task.priority) === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });


  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
  };

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TaskIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h4" fontWeight="bold">
              Tasks
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage and track your project tasks
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {stats.overdue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card
          sx={{
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
              <Box sx={{ flex: "1 1 300px", minWidth: "300px" }}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />
                  }}
                />
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="All">All Tasks</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="All">All Priorities</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: "1 1 150px", minWidth: "150px" }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowCreateDialog(true)}
                >
                  New Task
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card
          sx={{
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
          }}
        >
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterList />
                <Typography variant="h6" fontWeight="600">
                  Tasks ({filteredTasks.length})
                </Typography>
              </Box>
            }
          />
          <CardContent>
            {filteredTasks.length > 0 ? (
              <List>
                {filteredTasks.map((task, index) => (
                  <Box key={task.id}>
                    <TaskItem
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onLogWork={handleLogWork}
                      onAiGenerate={handleAiGenerate}
                      aiGenerating={aiGenerating}
                    />
                    {index < filteredTasks.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <TaskIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No tasks found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm || filterStatus !== "All" || filterPriority !== "All"
                    ? "Try adjusting your filters or search terms"
                    : "Get started by creating your first task"
                  }
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create Task
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
          }}
          onClick={() => setShowCreateDialog(true)}
        >
          <Add />
        </Fab>

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateTask}
        />
        <EditTaskDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingTask(null);
          }}
          onSubmit={handleUpdateTask}
          task={editingTask}
        />

        {/* Work Log Dialog */}
        <WorkLogDialog
          open={showWorkLogDialog}
          onClose={() => setShowWorkLogDialog(false)}
          task={selectedTask}
          workLogs={workLogs}
          onCreateWorkLog={handleCreateWorkLog}
          onGenerateExplanation={handleGenerateExplanation}
          isGeneratingExplanation={isGeneratingExplanation}
        />

        {/* AI Result Dialog */}
        <Dialog open={showAiDialog} onClose={() => setShowAiDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h6">
                AI Generated {aiAction === "description" ? "Description" : aiAction === "breakdown" ? "Breakdown" : "Optimization"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              p: 3, 
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              maxHeight: '60vh',
              overflow: 'auto'
            }}>
              {aiAction === "description" ? (
                <Box sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  '& h1, & h2, & h3': { 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    mb: 1
                  },
                  '& h1': { fontSize: '1.5rem' },
                  '& h2': { fontSize: '1.25rem' },
                  '& h3': { fontSize: '1.1rem' },
                  '& ul, & ol': { pl: 2, mb: 1 },
                  '& li': { mb: 0.5 }
                }}>
                  {aiResult}
                </Box>
              ) : aiAction === "breakdown" ? (
                <Box sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  '& h1, & h2, & h3': { 
                    color: 'secondary.main', 
                    fontWeight: 'bold',
                    mb: 1
                  },
                  '& h1': { fontSize: '1.5rem' },
                  '& h2': { fontSize: '1.25rem' },
                  '& h3': { fontSize: '1.1rem' },
                  '& ul, & ol': { pl: 2, mb: 1 },
                  '& li': { mb: 0.5 }
                }}>
                  {aiResult}
                </Box>
              ) : (
                <Box sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.6
                }}>
                  {aiResult}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCopyResult} startIcon={<ContentCopy />}>
              Copy
            </Button>
            <Button onClick={handleDownloadResult} startIcon={<Download />}>
              Download
            </Button>
            <Button onClick={() => setShowAiDialog(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}

// Create Task Dialog Component
const CreateTaskDialog = ({ 
  open, 
  onClose, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
    project_id: '',
    due_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      project_id: formData.project_id ? parseInt(formData.project_id) : undefined,
      due_date: formData.due_date || undefined,
      time_tracked: 0
    });
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      project_id: '',
      due_date: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Project ID (optional)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
            />
            
            <TextField
              margin="dense"
              label="Due Date"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Task</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Work Log Dialog Component
const WorkLogDialog = ({ 
  open, 
  onClose, 
  task, 
  workLogs, 
  onCreateWorkLog, 
  onGenerateExplanation, 
  isGeneratingExplanation 
}: { 
  open: boolean; 
  onClose: () => void; 
  task: Task | null; 
  workLogs: WorkLog[]; 
  onCreateWorkLog: (workLog: Omit<WorkLog, 'id' | 'created_at' | 'updated_at'>) => void;
  onGenerateExplanation: (workLog: WorkLog) => void;
  isGeneratingExplanation: boolean;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    hours_worked: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onCreateWorkLog({
        task_id: task.id,
        title: formData.title,
        hours_worked: parseFloat(formData.hours_worked),
        description: formData.description,
        is_billable: true,
        is_ai_generated: false,
        status: 'logged'
      });
      setFormData({ title: '', hours_worked: '', description: '' });
      setShowCreateForm(false);
    }
  };

  const totalHours = workLogs.reduce((sum, log) => sum + log.hours_worked, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AccessTime />
          <Typography variant="h6">
            Work Log - {task?.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {task && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.description || 'No description'}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip label={`Total: ${totalHours}h`} color="primary" />
              <Chip label={`Status: ${getStatusDisplay(task.status)}`} />
              <Chip label={`Priority: ${getPriorityDisplay(task.priority)}`} />
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Work Entries</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateForm(true)}
          >
            Log Work
          </Button>
        </Box>

        {showCreateForm && (
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Work Entry</Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="Hours"
                  type="number"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours_worked: e.target.value }))}
                  required
                  sx={{ minWidth: 120 }}
                  inputProps={{ step: "0.25" }}
                />
                <TextField
                  label="Description"
                  fullWidth
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button type="submit" variant="contained" size="small">
                  Add Entry
                </Button>
                <Button 
                  onClick={() => setShowCreateForm(false)} 
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Card>
        )}

        {workLogs.length > 0 ? (
          <List>
            {workLogs.map((log, index) => (
              <Box key={log.id}>
                <ListItem sx={{ flexDirection: "column", alignItems: "stretch", p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {log.hours_worked}h - {log.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AutoAwesome />}
                      onClick={() => onGenerateExplanation(log)}
                      disabled={isGeneratingExplanation}
                    >
                      {isGeneratingExplanation ? 'Generating...' : 'AI Explain'}
                    </Button>
                  </Box>
                  
                  {log.ai_explanation && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: "background.paper", borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        AI Explanation:
                      </Typography>
                      <Typography variant="body2">
                        {log.ai_explanation}
                      </Typography>
                    </Box>
                  )}
                </ListItem>
                {index < workLogs.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <AccessTime sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No work logged yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start tracking your work on this task
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setShowCreateForm(true)}
            >
              Log First Entry
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Edit Task Dialog Component
const EditTaskDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  task
}: { 
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  task: Task | null;
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    project_id: task?.project_id || ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || '',
        project_id: task.project_id || ''
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status as 'pending' | 'in_progress' | 'completed',
      priority: formData.priority as 'low' | 'medium' | 'high',
      due_date: formData.due_date || undefined,
      project_id: formData.project_id ? parseInt(formData.project_id.toString()) : undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'in_progress' | 'completed' })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Project ID (optional)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
            />
            
            <TextField
              margin="dense"
              label="Due Date"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Update Task</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};