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
  LinearProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { 
  Work as WorkIcon,
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Schedule,
  AttachMoney,
  AutoAwesome,
  Timeline,
  ContentCopy,
  Download,
  Flag
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Link from "next/link";
import { apiClient, Project } from "@/lib/api";
import toast from "react-hot-toast";

// Project status mapping
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'active': return 'In Progress';
    case 'completed': return 'Completed';
    case 'paused': return 'Paused';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'info';
    case 'completed': return 'success';
    case 'paused': return 'warning';
    default: return 'default';
  }
};

const ProjectCard = ({ project, onEdit, onDelete, onAiGenerate, onViewMilestones, aiGenerating }: { 
  project: Project; 
  onEdit: (project: Project) => void; 
  onDelete: (id: number) => void;
  onAiGenerate: (project: Project, action: "description" | "milestones") => void;
  onViewMilestones: (project: Project) => void;
  aiGenerating: number | null;
}) => {
  const theme = useTheme();

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
          <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
            {project.title}
          </Typography>
        }
        subheader={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {project.client_name || 'No client'}
            </Typography>
            <Chip
              label={getStatusDisplay(project.status)}
              size="small"
              color={getStatusColor(project.status) as any}
              variant="outlined"
            />
          </Box>
        }
        action={
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton 
              onClick={() => onViewMilestones(project)} 
              size="small" 
              color="info"
              title="View Milestones"
            >
              <Flag />
            </IconButton>
            <IconButton 
              onClick={() => onAiGenerate(project, "description")} 
              size="small" 
              color="primary"
              disabled={aiGenerating === project.id}
              title="AI Description"
            >
              <AutoAwesome />
            </IconButton>
            <IconButton 
              onClick={() => onAiGenerate(project, "milestones")} 
              size="small" 
              color="secondary"
              disabled={aiGenerating === project.id}
              title="AI Milestones"
            >
              <Timeline />
            </IconButton>
            <IconButton onClick={() => onEdit(project)} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => onDelete(project.id)} size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {project.description || 'No description provided'}
        </Typography>

        {/* Budget */}
        {project.budget && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="h6" fontWeight="600">
                ${project.budget.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Due Date */}
        {project.deadline && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Due: {new Date(project.deadline).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        {/* Created Date */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(project.created_at).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [aiGenerating, setAiGenerating] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiAction, setAiAction] = useState<"description" | "milestones" | null>(null);

  useEffect(() => {
    setMounted(true);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const projectsData = await apiClient.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await apiClient.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setShowCreateDialog(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async (project: Project) => {
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleUpdateProject = async (projectData: Partial<Project>) => {
    if (!editingProject) return;
    
    try {
      const updatedProject = await apiClient.updateProject(editingProject.id, projectData);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));
      setShowEditDialog(false);
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiClient.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        toast.success('Project deleted successfully');
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleAiGenerate = async (project: Project, action: "description" | "milestones") => {
    setAiGenerating(project.id);
    setAiAction(action);
    
    try {
      const tool = action === "description" ? "project_description" : "task_planner";
      const prompt = action === "description" 
        ? `Generate a detailed project description for: ${project.title}. Current description: ${project.description || 'None'}. Client: ${project.client_name}. Budget: ${project.budget || 'Not specified'}. Deadline: ${project.deadline || 'Not specified'}.`
        : `Create a detailed milestone breakdown for this project: ${project.title}. Description: ${project.description || 'None'}. Client: ${project.client_name}. Budget: ${project.budget || 'Not specified'}. Deadline: ${project.deadline || 'Not specified'}.`;

      const result = await apiClient.generateAIContent({
        tool,
        prompt,
        parameters: {
          project_title: project.title,
          project_description: project.description,
          client_name: project.client_name,
          budget: project.budget,
          deadline: project.deadline
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
    a.download = `project-${aiAction}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  const handleViewMilestones = (project: Project) => {
    // Navigate to milestones page with project filter
    window.location.href = `/dashboard/milestones?project=${project.id}`;
  };

  if (!mounted || loading || loadingProjects) {
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
          Please log in to view projects
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

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  };

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <WorkIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h4" fontWeight="bold">
              Projects
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your freelance projects
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
                  Total Projects
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
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
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
                  ${stats.totalBudget.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Budget
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Search */}
        <Card
          sx={{
            mb: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ minWidth: 150 }}
                onClick={() => setShowCreateDialog(true)}
              >
                New Project
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {filteredProjects.map((project) => (
            <Box key={project.id} sx={{ flex: "1 1 350px", minWidth: "350px" }}>
              <ProjectCard 
                project={project} 
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onAiGenerate={handleAiGenerate}
                onViewMilestones={handleViewMilestones}
                aiGenerating={aiGenerating}
              />
            </Box>
          ))}
        </Box>

        {filteredProjects.length === 0 && (
          <Card
            sx={{
              textAlign: "center",
              py: 6,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first project"}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create Project
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

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateProject}
        />
        <EditProjectDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingProject(null);
          }}
          onSubmit={handleUpdateProject}
          project={editingProject}
        />

        {/* AI Result Dialog */}
        <Dialog open={showAiDialog} onClose={() => setShowAiDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h6">
                AI Generated {aiAction === "description" ? "Description" : "Milestones"}
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

// Create Project Dialog Component
const CreateProjectDialog = ({ 
  open, 
  onClose, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    client_name: '',
    budget: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      client_name: formData.client_name || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      deadline: formData.deadline || undefined
    });
    setFormData({
      title: '',
      description: '',
      status: 'active',
      client_name: '',
      budget: '',
      deadline: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
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
          
          <TextField
            margin="dense"
            label="Client Name"
            fullWidth
            variant="outlined"
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Budget"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
            />
            
            <TextField
              margin="dense"
              label="Deadline"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Project</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Edit Project Dialog Component
const EditProjectDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  project
}: { 
  open: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => void;
  project: Project | null;
}) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    budget: project?.budget?.toString() || '',
    deadline: project?.deadline || ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        status: project.status,
        budget: project.budget?.toString() || '',
        deadline: project.deadline || ''
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status as 'active' | 'completed' | 'paused',
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      deadline: formData.deadline || undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
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
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Budget"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
          
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Update Project</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};