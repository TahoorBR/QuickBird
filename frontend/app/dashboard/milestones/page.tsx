"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  IconButton,
  useTheme,
  TextField,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Avatar,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
} from "@mui/material";
import { 
  Timeline as MilestoneIcon,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Work,
  Person,
  CalendarToday,
  Flag,
  PlayArrow,
  Pause,
  Stop
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient, Project, Milestone } from "@/lib/api";
import toast from "react-hot-toast";

const MilestoneCard = ({ milestone, onEdit, onDelete, onToggleStatus }: { 
  milestone: Milestone; 
  onEdit: (milestone: Milestone) => void; 
  onDelete: (id: number) => void;
  onToggleStatus: (milestone: Milestone) => void;
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'default';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <PlayArrow />;
      case 'in_progress': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'paused': return <Pause />;
      default: return <PlayArrow />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight="600">
              {milestone.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={milestone.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(milestone.status) as any}
                variant="outlined"
                size="small"
                icon={getStatusIcon(milestone.status)}
              />
              <Chip
                label={milestone.priority.toUpperCase()}
                color={getPriorityColor(milestone.priority) as any}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        }
        subheader={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              <Work sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Project ID: {milestone.project_id}
            </Typography>
            {milestone.due_date && (
              <Typography variant="body2" color="text.secondary">
                <CalendarToday sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Due: {new Date(milestone.due_date).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        }
        action={
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={() => onToggleStatus(milestone)}
              color={milestone.status === 'completed' ? 'success' : 'primary'}
              title={`Mark as ${milestone.status === 'completed' ? 'In Progress' : 'Completed'}`}
            >
              {milestone.status === 'completed' ? <PlayArrow /> : <CheckCircle />}
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(milestone)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(milestone.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {milestone.description || 'No description provided'}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {milestone.progress}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={milestone.progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {milestone.tasks?.length || 0} tasks
          </Typography>
          {milestone.completed_date && (
            <Typography variant="caption" color="success.main">
              Completed {new Date(milestone.completed_date).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default function MilestonesPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProject, setFilterProject] = useState("All");

  useEffect(() => {
    setMounted(true);
    loadMilestones();
    loadProjects();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoadingMilestones(true);
      const milestonesData = await apiClient.getMilestones();
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Failed to load milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoadingMilestones(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await apiClient.getProjects();
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleCreateMilestone = async (milestoneData: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'tasks'>) => {
    try {
      const newMilestone = await apiClient.createMilestone(milestoneData);
      setMilestones(prev => [...prev, newMilestone]);
      setShowCreateDialog(false);
      toast.success('Milestone created successfully');
    } catch (error) {
      console.error('Failed to create milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const handleEditMilestone = async (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowEditDialog(true);
  };

  const handleUpdateMilestone = async (milestoneData: Partial<Milestone>) => {
    if (!editingMilestone) return;
    
    try {
      const updatedMilestone = await apiClient.updateMilestone(editingMilestone.id, milestoneData);
      setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? updatedMilestone : m));
      setShowEditDialog(false);
      setEditingMilestone(null);
      toast.success('Milestone updated successfully');
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await apiClient.deleteMilestone(id);
        setMilestones(prev => prev.filter(m => m.id !== id));
        toast.success('Milestone deleted successfully');
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        toast.error('Failed to delete milestone');
      }
    }
  };

  const handleToggleStatus = async (milestone: Milestone) => {
    try {
      const newStatus: 'not_started' | 'in_progress' | 'completed' | 'paused' = 
        milestone.status === 'completed' ? 'in_progress' : 'completed';
      
      await apiClient.updateMilestoneStatus(milestone.id, newStatus);
      
      const updatedMilestone: Milestone = {
        ...milestone,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : milestone.progress,
        completed_date: newStatus === 'completed' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      };
      
      setMilestones(prev => prev.map(m => m.id === milestone.id ? updatedMilestone : m));
      toast.success(`Milestone marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  if (!mounted || loading || loadingMilestones) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
            Loading milestones...
          </Typography>
        </Box>
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
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please log in to view milestones.
        </Typography>
      </Box>
    );
  }

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || milestone.status === filterStatus;
    const matchesProject = filterProject === "All" || milestone.project_id.toString() === filterProject;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
  const totalMilestones = milestones.length;
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <MilestoneIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="bold">
            Milestones
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track project milestones and progress
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Milestones
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalMilestones}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {completedMilestones}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              In Progress
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {inProgressMilestones}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Completion Rate
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {completionRate}%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <MenuItem value="All">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </MenuItem>
                ))}
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">
          All Milestones ({filteredMilestones.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
        >
          Create Milestone
        </Button>
      </Box>

      {/* Milestones Grid */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {filteredMilestones.map((milestone) => (
          <Box key={milestone.id} sx={{ flex: "1 1 350px", minWidth: "350px" }}>
            <MilestoneCard 
              milestone={milestone} 
              onEdit={handleEditMilestone}
              onDelete={handleDeleteMilestone}
              onToggleStatus={handleToggleStatus}
            />
          </Box>
        ))}
      </Box>

      {filteredMilestones.length === 0 && (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <CardContent>
            <MilestoneIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No milestones found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first milestone to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Milestone
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Create Milestone Dialog */}
      <CreateMilestoneDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateMilestone}
        projects={projects}
      />
      <EditMilestoneDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingMilestone(null);
        }}
        onSubmit={handleUpdateMilestone}
        project={editingMilestone}
        projects={projects}
      />
    </Container>
  );
}

// Create Milestone Dialog Component
const CreateMilestoneDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  projects
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'tasks'>) => void;
  projects: Project[];
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'not_started' as 'not_started' | 'in_progress' | 'completed' | 'paused',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    progress: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find(p => p.id.toString() === formData.project_id);
    if (!project) return;
    
    onSubmit({
      ...formData,
      project_id: Number(formData.project_id),
      is_billable: true,
      progress: 0
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Milestone</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Milestone Title"
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id.toString()}>
                  {project.title}
                </MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            margin="dense"
            label="Due Date"
            fullWidth
            variant="outlined"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Progress (%)"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.progress}
            onChange={(e) => setFormData(prev => ({ ...prev, progress: Number(e.target.value) }))}
            inputProps={{ min: 0, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Milestone</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Edit Milestone Dialog Component
const EditMilestoneDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  project,
  projects
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (milestone: Partial<Milestone>) => void;
  project: Milestone | null;
  projects: Project[];
}) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'not_started',
    priority: project?.priority || 'medium',
    due_date: project?.due_date || '',
    project_id: project?.project_id || ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        due_date: project.due_date || '',
        project_id: project.project_id || ''
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status as 'not_started' | 'in_progress' | 'completed' | 'paused',
      priority: formData.priority as 'low' | 'medium' | 'high',
      due_date: formData.due_date || undefined,
      project_id: formData.project_id ? parseInt(formData.project_id.toString()) : undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Milestone</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
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
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              label="Project"
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'not_started' | 'in_progress' | 'completed' | 'paused' })}
              label="Status"
            >
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Update Milestone</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
