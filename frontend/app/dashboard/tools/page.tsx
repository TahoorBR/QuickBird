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
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Container
} from "@mui/material";
import { 
  Psychology as AIIcon,
  Add,
  Search,
  AutoAwesome,
  Description,
  Work,
  Assessment,
  Chat,
  Code,
  Image,
  VideoLibrary,
  Send,
  ContentCopy,
  Refresh,
  AccessTime,
  Download
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

// Real AI tools with advanced prompts
const aiTools = [
  {
    id: 1,
    name: "Proposal Generator",
    description: "Generate professional project proposals with AI assistance",
    icon: Description,
    category: "Business",
    color: "#4CAF50",
    tool_key: "proposal_generator",
    status: "active",
    prompt_template: "Generate a professional proposal for: {input}\n\nInclude: Executive Summary, Requirements Understanding, Proposed Solution, Timeline, Pricing, Why Choose Me, Next Steps",
    smart_features: {
      project_selector: true,
      client_selector: true,
      budget_estimator: true,
      template_selector: true
    }
  },
  {
    id: 2,
    name: "Cover Letter Creator",
    description: "Create compelling cover letters and professional bios",
    icon: Work,
    category: "Business",
    color: "#2196F3",
    tool_key: "cover_letter",
    status: "active",
    prompt_template: "Create a professional cover letter for: {input}\n\nFocus on: Skills, Experience, Value Proposition, Professional Tone"
  },
  {
    id: 3,
    name: "Contract Generator",
    description: "Generate comprehensive freelance contract templates",
    icon: Assessment,
    category: "Legal",
    color: "#FF9800",
    tool_key: "contract_generator",
    status: "active",
    prompt_template: "Generate a professional contract template for: {input}\n\nInclude: Scope, Payment Terms, Deadlines, IP Rights, Termination Clauses"
  },
  {
    id: 4,
    name: "Invoice Generator",
    description: "Create detailed, professional invoices",
    icon: Description,
    category: "Business",
    color: "#9C27B0",
    tool_key: "invoice_generator",
    status: "active",
    prompt_template: "Generate a professional invoice for: {input}\n\nInclude: Services, Rates, Hours, Taxes, Payment Terms, Due Date",
    smart_features: {
      project_selector: true,
      task_selector: true,
      hourly_rate_calculator: true,
      tax_calculator: true,
      template_selector: true
    }
  },
  {
    id: 5,
    name: "Price Estimator",
    description: "Get accurate project pricing estimates",
    icon: Assessment,
    category: "Business",
    color: "#F44336",
    tool_key: "price_estimator",
    status: "active",
    prompt_template: "Provide detailed pricing estimate for: {input}\n\nConsider: Complexity, Time Required, Market Rates, Value Provided, Hourly vs Fixed Options"
  },
  {
    id: 6,
    name: "Task Planner",
    description: "Create detailed project task breakdowns and timelines",
    icon: Work,
    category: "Project Management",
    color: "#00BCD4",
    tool_key: "task_planner",
    status: "active",
    prompt_template: "Create a detailed task plan for: {input}\n\nInclude: Task Breakdown, Dependencies, Milestones, Estimated Durations, Timeline"
  },
  {
    id: 7,
    name: "Communication Templates",
    description: "Generate professional client communication templates",
    icon: Chat,
    category: "Communication",
    color: "#795548",
    tool_key: "communication_template",
    status: "active",
    prompt_template: "Generate professional communication template for: {input}\n\nFocus on: Clarity, Professionalism, Appropriate Tone, Action Items"
  },
  {
    id: 8,
    name: "Portfolio Case Study",
    description: "Create compelling portfolio case studies",
    icon: AutoAwesome,
    category: "Portfolio",
    color: "#607D8B",
    tool_key: "portfolio_case_study",
    status: "active",
    prompt_template: "Create a compelling case study for: {input}\n\nInclude: Project Overview, Challenges, Solutions, Results, Impact, Lessons Learned"
  },
  {
    id: 9,
    name: "Feedback Analyzer",
    description: "Analyze client feedback and provide actionable insights",
    icon: Assessment,
    category: "Analytics",
    color: "#E91E63",
    tool_key: "feedback_analyzer",
    status: "active",
    prompt_template: "Analyze this feedback and provide insights: {input}\n\nFocus on: Strengths, Areas for Improvement, Actionable Recommendations, Patterns"
  },
  {
    id: 10,
    name: "Time Tracking Summary",
    description: "Generate intelligent time tracking summaries and insights",
    icon: AccessTime,
    category: "Productivity",
    color: "#3F51B5",
    tool_key: "time_tracker_summary",
    status: "active",
    prompt_template: "Analyze this time tracking data and provide insights: {input}\n\nInclude: Productivity Patterns, Time Allocation, Efficiency Recommendations, Trends"
  }
];

const ToolCard = ({ tool, onUse }: any) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
      onClick={() => onUse(tool)}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: alpha(tool.color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <tool.icon sx={{ fontSize: 24, color: tool.color }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="600">
                {tool.name}
              </Typography>
              <Chip
                label={tool.category}
                size="small"
                sx={{
                  backgroundColor: alpha(tool.color, 0.1),
                  color: tool.color,
                  border: `1px solid ${alpha(tool.color, 0.3)}`,
                }}
              />
            </Box>
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {tool.description}
          </Typography>
        }
        action={
          <Chip
            label={tool.status === 'active' ? 'Active' : 'Inactive'}
            color={tool.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        }
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {tool.prompt_template}
        </Typography>
        
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesome />}
          disabled={tool.status !== 'active'}
          sx={{
            background: `linear-gradient(45deg, ${tool.color}, ${alpha(tool.color, 0.7)})`,
            "&:hover": {
              background: `linear-gradient(45deg, ${alpha(tool.color, 0.8)}, ${alpha(tool.color, 0.6)})`,
            },
          }}
        >
          Use Tool
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ToolsPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [tools] = useState(aiTools);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, tasksData, clientsData] = await Promise.all([
        apiClient.getProjects().catch(() => []),
        apiClient.getTasks().catch(() => []),
        apiClient.getClients().catch(() => [])
      ]);
      
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

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
          Please log in to access AI tools
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

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTool = (tool: any) => {
    setSelectedTool(tool);
    setDialogOpen(true);
    setInputText("");
    setGeneratedContent("");
  };

  const handleGenerate = async () => {
    if (!inputText.trim() || !selectedTool) return;
    
    setIsGenerating(true);
    
    try {
      // Build smart parameters based on tool features
      const parameters: any = {};
      let context = "";
      
      if (selectedTool.smart_features) {
        if (selectedTool.smart_features.project_selector && selectedProject) {
          parameters.project_title = selectedProject.title;
          parameters.project_description = selectedProject.description;
          parameters.project_budget = selectedProject.budget;
          parameters.project_deadline = selectedProject.deadline;
          context += `Project: ${selectedProject.title} (${selectedProject.client_name})\n`;
        }
        
        if (selectedTool.smart_features.task_selector && selectedTask) {
          parameters.task_title = selectedTask.title;
          parameters.task_description = selectedTask.description;
          parameters.task_priority = selectedTask.priority;
          parameters.task_hours = selectedTask.estimated_hours;
          context += `Task: ${selectedTask.title}\n`;
        }
        
        if (selectedTool.smart_features.client_selector && selectedClient) {
          parameters.client_name = selectedClient.name;
          parameters.client_email = selectedClient.email;
          parameters.client_company = selectedClient.company;
          context += `Client: ${selectedClient.name} (${selectedClient.company})\n`;
        }
        
        if (selectedTool.smart_features.hourly_rate_calculator && hourlyRate > 0) {
          parameters.hourly_rate = hourlyRate;
          context += `Hourly Rate: $${hourlyRate}/hour\n`;
        }
        
        if (selectedTool.smart_features.tax_calculator && taxRate > 0) {
          parameters.tax_rate = taxRate;
          context += `Tax Rate: ${taxRate}%\n`;
        }
      }
      
      const response = await apiClient.generateAIContent({
        tool: selectedTool.tool_key,
        prompt: inputText,
        parameters,
        context
      });
      
      setGeneratedContent(response.result);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const categories = ["All", ...Array.from(new Set(tools.map(tool => tool.category)))];

  const stats = {
    totalTools: tools.length,
    activeTools: tools.filter(t => t.status === 'active').length,
    categories: Array.from(new Set(tools.map(t => t.category))).length
  };

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <AIIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            <Typography variant="h4" fontWeight="bold">
              AI Tools
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Leverage AI-powered tools to enhance your freelance business
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stats.totalTools}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Tools
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.activeTools}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Tools
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {stats.categories}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <Card
              sx={{
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Powered
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }} alignItems="center">
              <Box sx={{ flex: "1 1 100%", minWidth: "100%" }}>
                <TextField
                  fullWidth
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />
                  }}
                />
              </Box>
              <Box sx={{ flex: "1 1 100%", minWidth: "100%" }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: "1 1 100%", minWidth: "100%" }} >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {filteredTools.map((tool) => (
            <Box sx={{ flex: "1 1 300px", minWidth: "250px" }} key={tool.id}>
              <ToolCard tool={tool} onUse={handleUseTool} />
            </Box>
          ))}
        </Box>

        {filteredTools.length === 0 && (
          <Card
            sx={{
              textAlign: "center",
              py: 6,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <AIIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No tools found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* AI Tool Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {selectedTool?.icon && <selectedTool.icon sx={{ color: selectedTool?.color }} />}
              <Typography variant="h6">
                {selectedTool?.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {/* Smart Features */}
              {selectedTool?.smart_features && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Smart Features
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {selectedTool.smart_features.project_selector && (
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Select Project</InputLabel>
                        <Select
                          value={selectedProject?.id || ''}
                          onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)}
                        >
                          {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                              {project.title} - {project.client_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {selectedTool.smart_features.task_selector && (
                      <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Select Task</InputLabel>
                        <Select
                          value={selectedTask?.id || ''}
                          onChange={(e) => setSelectedTask(tasks.find(t => t.id === e.target.value) || null)}
                        >
                          {tasks.map((task) => (
                            <MenuItem key={task.id} value={task.id}>
                              {task.title} - {task.priority}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {selectedTool.smart_features.hourly_rate_calculator && (
                      <TextField
                        label="Hourly Rate ($)"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        sx={{ minWidth: 150 }}
                      />
                    )}
                    
                    {selectedTool.smart_features.tax_calculator && (
                      <TextField
                        label="Tax Rate (%)"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        sx={{ minWidth: 150 }}
                      />
                    )}
                  </Box>
                </Box>
              )}
              
              <TextField
                fullWidth
                label="Input your request"
                multiline
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe what you want to generate..."
                sx={{ mb: 3 }}
              />
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerate}
                disabled={!inputText.trim() || isGenerating}
                startIcon={isGenerating ? <LinearProgress /> : <AutoAwesome />}
                sx={{ mb: 3 }}
              >
                {isGenerating ? "Generating..." : "Generate Content"}
              </Button>

              {generatedContent && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Generated Content</Typography>
                    <Box>
                      <Button
                        startIcon={<ContentCopy />}
                        onClick={handleCopyContent}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Copy
                      </Button>
                      <Button
                        startIcon={<Download />}
                        onClick={() => {
                          const blob = new Blob([generatedContent], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${selectedTool?.name || 'ai-content'}-${Date.now()}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success('Downloaded successfully!');
                        }}
                        size="small"
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      maxHeight: '400px',
                      overflow: 'auto'
                    }}
                  >
                    {selectedTool?.tool_key === 'proposal_generator' || selectedTool?.tool_key === 'cover_letter' ? (
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
                        '& li': { mb: 0.5 },
                        '& p': { mb: 1 }
                      }}>
                        {generatedContent}
                      </Box>
                    ) : selectedTool?.tool_key === 'invoice_generator' ? (
                      <Box sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        '& .invoice-header': { 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: 'primary.main'
                        }
                      }}>
                        {generatedContent}
                      </Box>
                    ) : selectedTool?.tool_key === 'contract_generator' ? (
                      <Box sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        '& h1, & h2, & h3': { 
                          color: 'warning.main', 
                          fontWeight: 'bold',
                          mb: 1
                        },
                        '& h1': { fontSize: '1.4rem' },
                        '& h2': { fontSize: '1.2rem' },
                        '& h3': { fontSize: '1.05rem' },
                        '& ul, & ol': { pl: 2, mb: 1 },
                        '& li': { mb: 0.5 }
                      }}>
                        {generatedContent}
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {generatedContent}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}