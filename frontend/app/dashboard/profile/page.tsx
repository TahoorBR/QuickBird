"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Avatar,
  TextField,
  Divider,
  Container,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  Stack,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Fade,
  Slide,
  useTheme,
  alpha
} from "@mui/material";
import { 
  Person,
  Email,
  CalendarToday,
  Business,
  Security,
  Edit,
  Save,
  Cancel,
  LocationOn,
  Phone,
  Language,
  Work,
  School,
  Star,
  TrendingUp,
  Timeline,
  Settings,
  Notifications,
  Palette,
  Lock,
  Public,
  Verified
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const theme = useCustomTheme();
  const muiTheme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    company: '',
    bio: '',
    phone: '',
    website: '',
    location: '',
    skills: '',
    experience: '',
    education: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        company: '',
        bio: '',
        phone: '',
        website: '',
        location: '',
        skills: '',
        experience: '',
        education: ''
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        company: '',
        bio: '',
        phone: '',
        website: '',
        location: '',
        skills: '',
        experience: '',
        education: ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoadingProfile(true);
      // In a real app, you would call an API to update the user profile
      // await apiClient.updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
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
          Please log in to view your profile
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.1)} 0%, ${alpha(muiTheme.palette.secondary.main, 0.1)} 100%)` }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Fade in={mounted} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${muiTheme.palette.background.paper} 0%, ${alpha(muiTheme.palette.primary.main, 0.05)} 100%)`,
              borderRadius: 4,
              p: 4,
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`
              }
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: muiTheme.palette.primary.main,
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  boxShadow: `0 8px 32px ${alpha(muiTheme.palette.primary.main, 0.3)}`
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="h3" fontWeight="700" color="text.primary">
                    {user.full_name || user.username}
                  </Typography>
                  <Chip
                    icon={<Verified />}
                    label={user.subscription_tier?.toUpperCase() || 'FREE'}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {user.email}
                </Typography>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    icon={<CalendarToday />}
                    label={`Member since ${new Date(user.created_at).toLocaleDateString()}`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${user.usage_count || 0} AI Requests`}
                    variant="outlined"
                    size="small"
                    color="success"
                  />
                </Stack>
              </Box>
              
              <Box>
                {!isEditing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="contained"
                    size="large"
                    sx={{ borderRadius: 3, px: 4 }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={loadingProfile}
                      size="large"
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="large"
                      sx={{ borderRadius: 3, px: 4 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>
            </Stack>
          </Paper>
        </Fade>

        {/* Tabs Section */}
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 2
              }
            }}
          >
            <Tab icon={<Person />} label="Personal Info" />
            <Tab icon={<Work />} label="Professional" />
            <Tab icon={<Settings />} label="Account Settings" />
            <Tab icon={<Timeline />} label="Activity" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ minHeight: 400 }}>
          {/* Personal Info Tab */}
          {activeTab === 0 && (
            <Slide direction="up" in={activeTab === 0} timeout={300}>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
                gap: 3 
              }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="Basic Information"
                    avatar={<Person color="primary" />}
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <TextField
                        label="Full Name"
                        value={formData.full_name}
                        onChange={handleInputChange('full_name')}
                        fullWidth
                        disabled={!isEditing}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                      <TextField
                        label="Username"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        fullWidth
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                      />
                      <TextField
                        label="Email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        fullWidth
                        disabled={!isEditing}
                        type="email"
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                      />
                      <TextField
                        label="Phone"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        fullWidth
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                      />
                      <TextField
                        label="Location"
                        value={formData.location}
                        onChange={handleInputChange('location')}
                        fullWidth
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="About You"
                    avatar={<School color="primary" />}
                  />
                  <CardContent>
                    <TextField
                      label="Bio"
                      value={formData.bio}
                      onChange={handleInputChange('bio')}
                      fullWidth
                      multiline
                      rows={6}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself, your interests, and what drives you..."
                      sx={{ mb: 3 }}
                    />
                    <TextField
                      label="Website"
                      value={formData.website}
                      onChange={handleInputChange('website')}
                      fullWidth
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Language sx={{ mr: 1, color: "text.secondary" }} />
                      }}
                    />
                  </CardContent>
                </Card>
              </Box>
            </Slide>
          )}

          {/* Professional Tab */}
          {activeTab === 1 && (
            <Slide direction="up" in={activeTab === 1} timeout={300}>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
                gap: 3 
              }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="Work Information"
                    avatar={<Work color="primary" />}
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <TextField
                        label="Company"
                        value={formData.company}
                        onChange={handleInputChange('company')}
                        fullWidth
                        disabled={!isEditing}
                        InputProps={{
                          startAdornment: <Business sx={{ mr: 1, color: "text.secondary" }} />
                        }}
                      />
                      <TextField
                        label="Experience"
                        value={formData.experience}
                        onChange={handleInputChange('experience')}
                        fullWidth
                        disabled={!isEditing}
                        multiline
                        rows={3}
                        placeholder="Describe your professional experience..."
                      />
                      <TextField
                        label="Education"
                        value={formData.education}
                        onChange={handleInputChange('education')}
                        fullWidth
                        disabled={!isEditing}
                        multiline
                        rows={3}
                        placeholder="Your educational background..."
                      />
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="Skills & Expertise"
                    avatar={<Star color="primary" />}
                  />
                  <CardContent>
                    <TextField
                      label="Skills"
                      value={formData.skills}
                      onChange={handleInputChange('skills')}
                      fullWidth
                      disabled={!isEditing}
                      multiline
                      rows={4}
                      placeholder="List your key skills and areas of expertise..."
                    />
                  </CardContent>
                </Card>
              </Box>
            </Slide>
          )}

          {/* Account Settings Tab */}
          {activeTab === 2 && (
            <Slide direction="up" in={activeTab === 2} timeout={300}>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", 
                gap: 3 
              }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="Account Statistics"
                    avatar={<TrendingUp color="primary" />}
                  />
                  <CardContent>
                    <Box sx={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                      gap: 3 
                    }}>
                      <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: alpha(muiTheme.palette.primary.main, 0.1) }}>
                        <Typography variant="h3" color="primary" fontWeight="700">
                          {user.usage_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          AI Requests Used
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: alpha(muiTheme.palette.success.main, 0.1) }}>
                        <Typography variant="h3" color="success.main" fontWeight="700">
                          {user.usage_limit || 10}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Daily Limit
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: alpha(muiTheme.palette.warning.main, 0.1) }}>
                        <Typography variant="h3" color="warning.main" fontWeight="700">
                          {Math.round(((user.usage_limit || 10) - (user.usage_count || 0)) / (user.usage_limit || 10) * 100)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remaining
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, bgcolor: alpha(muiTheme.palette.info.main, 0.1) }}>
                        <Typography variant="h3" color="info.main" fontWeight="700">
                          {user.subscription_tier?.toUpperCase() || 'FREE'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Plan
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                  <CardHeader
                    title="Security & Privacy"
                    avatar={<Security color="primary" />}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Button
                        startIcon={<Lock />}
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        Change Password
                      </Button>
                      <Button
                        startIcon={<Notifications />}
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        Notification Settings
                      </Button>
                      <Button
                        startIcon={<Palette />}
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        Theme Preferences
                      </Button>
                      <Button
                        startIcon={<Public />}
                        variant="outlined"
                        fullWidth
                        sx={{ justifyContent: 'flex-start', py: 1.5 }}
                      >
                        Privacy Settings
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Slide>
          )}

          {/* Activity Tab */}
          {activeTab === 3 && (
            <Slide direction="up" in={activeTab === 3} timeout={300}>
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${muiTheme.palette.divider}` }}>
                <CardHeader
                  title="Recent Activity"
                  avatar={<Timeline color="primary" />}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Activity tracking will be available soon. We're working on bringing you detailed insights into your usage patterns and productivity metrics.
                    </Alert>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Timeline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No recent activity to display
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your activity timeline will appear here once you start using QuickBird features.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Slide>
          )}
        </Box>
      </Container>
    </Box>
  );
}