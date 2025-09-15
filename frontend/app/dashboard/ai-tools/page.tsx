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
  Tabs,
  Tab,
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
  Avatar
} from "@mui/material";
import { 
  Psychology,
  Add,
  Upload,
  Description,
  Person,
  Work,
  Assignment,
  Receipt,
  Timeline,
  ContentCopy,
  Download,
  AutoAwesome,
  FileUpload,
  Delete,
  Edit,
  Save,
  Cancel,
  SmartToy,
  Analytics,
  Schedule,
  TrendingUp,
  Assessment,
  Description as ReportIcon,
  Description as Contract,
  Description as Proposal,
  Email,
  AttachMoney as PriceCheck,
  Message as Communication,
  Folder as Portfolio,
  Feedback
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient, Project, Task, Client, Invoice } from "@/lib/api";
import toast from "react-hot-toast";

interface AIProfile {
  id: number;
  name: string;
  profession: string;
  experience: string;
  skills: string[];
  bio: string;
  resume_text: string;
  created_at: string;
  updated_at: string;
}

interface UploadedFile {
  id: number;
  name: string;
  type: string;
  content: string;
  uploaded_at: string;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  inputs: {
    type: 'text' | 'select' | 'file' | 'textarea';
    label: string;
    options?: any[];
    required?: boolean;
    placeholder?: string;
  }[];
}

const AI_TOOLS: AITool[] = [
  {
    id: 'proposal_generator',
    name: 'Project Proposal Generator',
    description: 'Generate professional project proposals based on client and project data',
    icon: <Description />,
    category: 'Business',
    inputs: [
      { type: 'select', label: 'Client', options: [], required: true },
      { type: 'select', label: 'Project Type', options: ['Web Development', 'Mobile App', 'Design', 'Consulting', 'Other'], required: true },
      { type: 'text', label: 'Project Budget', placeholder: 'Enter budget range' },
      { type: 'textarea', label: 'Project Requirements', placeholder: 'Describe the project requirements' }
    ]
  },
  {
    id: 'contract_generator',
    name: 'Contract Generator',
    description: 'Create professional contracts and agreements',
    icon: <Contract />,
    category: 'Legal',
    inputs: [
      { type: 'select', label: 'Client', options: [], required: true },
      { type: 'select', label: 'Contract Type', options: ['Service Agreement', 'NDA', 'Work for Hire', 'Consulting', 'Other'], required: true },
      { type: 'text', label: 'Project Duration', placeholder: 'e.g., 3 months' },
      { type: 'text', label: 'Payment Terms', placeholder: 'e.g., 50% upfront, 50% on completion' }
    ]
  },
  {
    id: 'invoice_generator',
    name: 'Invoice Generator',
    description: 'Generate detailed invoices with project breakdown',
    icon: <Receipt />,
    category: 'Financial',
    inputs: [
      { type: 'select', label: 'Client', options: [], required: true },
      { type: 'select', label: 'Project', options: [], required: true },
      { type: 'text', label: 'Payment Terms', placeholder: 'e.g., Net 30' },
      { type: 'text', label: 'Additional Notes', placeholder: 'Any special instructions' }
    ]
  },
  {
    id: 'time_tracker_summary',
    name: 'Time Tracking Summary',
    description: 'Generate comprehensive time tracking reports and summaries',
    icon: <Schedule />,
    category: 'Productivity',
    inputs: [
      { type: 'select', label: 'Project', options: [], required: false },
      { type: 'text', label: 'Date Range', placeholder: 'e.g., Last 30 days' },
      { type: 'select', label: 'Format', options: ['Summary', 'Detailed', 'Client Report'], required: true }
    ]
  },
  {
    id: 'project_description',
    name: 'Project Description Generator',
    description: 'Create detailed project descriptions and documentation',
    icon: <Work />,
    category: 'Project Management',
    inputs: [
      { type: 'select', label: 'Project', options: [], required: true },
      { type: 'select', label: 'Description Type', options: ['Overview', 'Technical Specs', 'User Stories', 'Timeline'], required: true },
      { type: 'textarea', label: 'Additional Context', placeholder: 'Any specific requirements or context' }
    ]
  },
  {
    id: 'task_planner',
    name: 'Smart Task Planner',
    description: 'AI-powered task breakdown and scheduling',
    icon: <Assignment />,
    category: 'Productivity',
    inputs: [
      { type: 'select', label: 'Project', options: [], required: true },
      { type: 'text', label: 'Project Duration', placeholder: 'e.g., 2 weeks' },
      { type: 'select', label: 'Team Size', options: ['1', '2-3', '4-5', '6+'], required: true },
      { type: 'textarea', label: 'Project Goals', placeholder: 'Describe the main objectives' }
    ]
  },
  {
    id: 'price_estimator',
    name: 'Price Estimator',
    description: 'Estimate project costs and pricing based on scope',
    icon: <PriceCheck />,
    category: 'Financial',
    inputs: [
      { type: 'select', label: 'Project Type', options: ['Web Development', 'Mobile App', 'Design', 'Consulting', 'Other'], required: true },
      { type: 'text', label: 'Estimated Hours', placeholder: 'e.g., 40-60 hours' },
      { type: 'text', label: 'Complexity Level', placeholder: 'Simple, Medium, Complex' },
      { type: 'textarea', label: 'Project Scope', placeholder: 'Describe the project scope' }
    ]
  },
  {
    id: 'communication_templates',
    name: 'Communication Templates',
    description: 'Generate professional emails and communication templates',
    icon: <Email />,
    category: 'Communication',
    inputs: [
      { type: 'select', label: 'Template Type', options: ['Client Update', 'Project Proposal', 'Invoice Reminder', 'Project Completion', 'Custom'], required: true },
      { type: 'select', label: 'Client', options: [], required: false },
      { type: 'text', label: 'Subject', placeholder: 'Email subject line' },
      { type: 'textarea', label: 'Key Points', placeholder: 'Main points to include' }
    ]
  },
  {
    id: 'portfolio_case_study',
    name: 'Portfolio Case Study',
    description: 'Create compelling case studies for your portfolio',
    icon: <Portfolio />,
    category: 'Marketing',
    inputs: [
      { type: 'select', label: 'Project', options: [], required: true },
      { type: 'select', label: 'Case Study Type', options: ['Success Story', 'Problem-Solution', 'Process Overview', 'Results Focused'], required: true },
      { type: 'textarea', label: 'Key Achievements', placeholder: 'Highlight key results and achievements' }
    ]
  },
  {
    id: 'feedback_analyzer',
    name: 'Feedback Analyzer',
    description: 'Analyze client feedback and generate insights',
    icon: <Feedback />,
    category: 'Analytics',
    inputs: [
      { type: 'file', label: 'Upload Feedback File', required: true },
      { type: 'select', label: 'Analysis Type', options: ['Sentiment Analysis', 'Key Themes', 'Action Items', 'Client Satisfaction'], required: true },
      { type: 'textarea', label: 'Additional Context', placeholder: 'Any additional context about the feedback' }
    ]
  }
];

export default function AIToolsPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [showToolDialog, setShowToolDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  // Data for dropdowns
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // AI Profile and Files
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
    loadAIProfile();
    loadUploadedFiles();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, tasksData, clientsData, invoicesData] = await Promise.all([
        apiClient.getProjects().catch(() => []),
        apiClient.getTasks().catch(() => []),
        apiClient.getClients().catch(() => []),
        apiClient.getInvoices().catch(() => [])
      ]);
      
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setClients(clientsData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    }
  };

  const loadAIProfile = async () => {
    try {
      // Mock AI profile - in real app, this would come from API
      setAiProfile({
        id: 1,
        name: user?.full_name || user?.username || 'User',
        profession: 'Freelancer',
        experience: '5+ years',
        skills: ['Web Development', 'React', 'Node.js', 'Python'],
        bio: 'Experienced full-stack developer specializing in modern web applications.',
        resume_text: 'Experienced software developer with expertise in full-stack development...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load AI profile:', error);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      // Load uploaded files from API - start with empty list
      setUploadedFiles([]);
    } catch (error) {
      console.error('Failed to load uploaded files:', error);
    }
  };

  const handleToolSelect = (tool: AITool) => {
    setSelectedTool(tool);
    setFormData({});
    setShowToolDialog(true);
  };

  const handleInputChange = (inputLabel: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [inputLabel]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploadedFile(file);
        // Upload file to server
        const response = await apiClient.uploadFile(file, 'project');
        toast.success('File uploaded successfully');
        
        // Add to uploaded files list
        const newFile: UploadedFile = {
          id: Date.now(),
          name: file.name,
          type: file.type,
          content: response.url,
          uploaded_at: new Date().toISOString()
        };
        setUploadedFiles(prev => [...prev, newFile]);
      } catch (error) {
        console.error('File upload failed:', error);
        toast.error('Failed to upload file');
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedTool) return;
    
    try {
      setAiGenerating(true);
      
      // Build context with AI profile and uploaded files
      const context = {
        user_profile: aiProfile,
        uploaded_files: uploadedFiles,
        form_data: formData,
        projects: projects,
        clients: clients,
        tasks: tasks
      };
      
      const response = await apiClient.generateContent({
        tool: selectedTool.id,
        prompt: `Generate ${selectedTool.name} with the following context: ${JSON.stringify(context)}`,
        parameters: formData
      });
      
      setAiResult(response.result);
      setShowResultDialog(true);
      setShowToolDialog(false);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast.error('Failed to generate content');
    } finally {
      setAiGenerating(false);
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
    a.download = `${selectedTool?.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  };

  const getToolsByCategory = (category: string) => {
    return AI_TOOLS.filter(tool => tool.category === category);
  };

  const categories = [...new Set(AI_TOOLS.map(tool => tool.category))];

  if (!mounted || loading) {
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
          Please log in to access AI tools
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
            AI Tools
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Person />}
              onClick={() => setShowProfileDialog(true)}
            >
              AI Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setShowFileDialog(true)}
            >
              Upload Files
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Leverage AI to generate professional content, analyze data, and automate your workflow.
        </Typography>
      </Box>

      {/* AI Profile & Files Summary */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Card>
            <CardHeader
              title="AI Profile"
              avatar={<Person />}
              action={
                <IconButton onClick={() => setShowProfileDialog(true)}>
                  <Edit />
                </IconButton>
              }
            />
            <CardContent>
              {aiProfile ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>{aiProfile.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {aiProfile.profession} • {aiProfile.experience}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {aiProfile.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">No AI profile set</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Card>
            <CardHeader
              title="Uploaded Files"
              avatar={<Upload />}
              action={
                <IconButton onClick={() => setShowFileDialog(true)}>
                  <Add />
                </IconButton>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {uploadedFiles.length} files uploaded
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Files are used to provide context for AI generation
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* AI Tools by Category */}
      <Card>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab key={category} label={category} />
          ))}
        </Tabs>
        
        <CardContent>
          <Box sx={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: 3 
          }}>
            {getToolsByCategory(categories[tabValue]).map((tool) => (
              <Card 
                key={tool.id}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
                onClick={() => handleToolSelect(tool)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      {tool.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tool.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Tool Dialog */}
      <Dialog open={showToolDialog} onClose={() => setShowToolDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {selectedTool?.icon}
            {selectedTool?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedTool?.description}
          </Typography>
          
          {selectedTool?.inputs.map((input, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              {input.type === 'text' && (
                <TextField
                  fullWidth
                  label={input.label}
                  placeholder={input.placeholder}
                  value={formData[input.label] || ''}
                  onChange={(e) => handleInputChange(input.label, e.target.value)}
                  required={input.required}
                />
              )}
              
              {input.type === 'textarea' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={input.label}
                  placeholder={input.placeholder}
                  value={formData[input.label] || ''}
                  onChange={(e) => handleInputChange(input.label, e.target.value)}
                  required={input.required}
                />
              )}
              
              {input.type === 'select' && (
                <FormControl fullWidth required={input.required}>
                  <InputLabel>{input.label}</InputLabel>
                  <Select
                    value={formData[input.label] || ''}
                    onChange={(e) => handleInputChange(input.label, e.target.value)}
                    label={input.label}
                  >
                    {input.options?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {input.type === 'file' && (
                <Box>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id={`file-upload-${index}`}
                  />
                  <label htmlFor={`file-upload-${index}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<FileUpload />}
                      fullWidth
                    >
                      {uploadedFile ? uploadedFile.name : `Upload ${input.label}`}
                    </Button>
                  </label>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowToolDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerate} 
            variant="contained"
            disabled={aiGenerating}
            startIcon={<AutoAwesome />}
          >
            {aiGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesome />
              Generated Content
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={handleCopyResult} size="small">
                <ContentCopy />
              </IconButton>
              <IconButton onClick={handleDownloadResult} size="small">
                <Download />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {aiResult}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Profile Dialog */}
      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Profile Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your AI profile helps generate more personalized and relevant content.
          </Typography>
          <TextField
            fullWidth
            label="Profession"
            value={aiProfile?.profession || ''}
            onChange={(e) => setAiProfile(prev => prev ? {...prev, profession: e.target.value} : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Experience Level"
            value={aiProfile?.experience || ''}
            onChange={(e) => setAiProfile(prev => prev ? {...prev, experience: e.target.value} : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Bio"
            value={aiProfile?.bio || ''}
            onChange={(e) => setAiProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resume Text"
            value={aiProfile?.resume_text || ''}
            onChange={(e) => setAiProfile(prev => prev ? {...prev, resume_text: e.target.value} : null)}
            placeholder="Paste your resume text here for better AI context"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowProfileDialog(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={showFileDialog} onClose={() => setShowFileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Files for AI Context</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload files that AI can use as context for generating content.
          </Typography>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileUpload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload File
            </Button>
          </label>
          
          {uploadedFiles.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Files</Typography>
              <List>
                {uploadedFiles.map((file) => (
                  <ListItem key={file.id}>
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={new Date(file.uploaded_at).toLocaleDateString()}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
