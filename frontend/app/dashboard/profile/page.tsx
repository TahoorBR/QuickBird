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
  Grid,
  Divider,
  Container,
  LinearProgress,
  Alert,
  Chip
} from "@mui/material";
import { 
  Person,
  Email,
  CalendarToday,
  Business,
  Security,
  Edit,
  Save,
  Cancel
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const theme = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    company: '',
    bio: '',
    phone: '',
    website: '',
    location: ''
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
        location: ''
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
        location: ''
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
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  bgcolor: theme.theme.palette.primary.main,
                  fontSize: "3rem"
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                {user.full_name || user.username}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              
              <Chip
                label={user.subscription_tier?.toUpperCase() || 'FREE'}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Profile Information"
              action={
                !isEditing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="outlined"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={loadingProfile}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                  </Box>
                )
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
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
                </Grid>
                
                <Grid item xs={12} sm={6}>
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
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    value={formData.full_name}
                    onChange={handleInputChange('full_name')}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
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
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Website"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    fullWidth
                    disabled={!isEditing}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    value={formData.bio}
                    onChange={handleInputChange('bio')}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Stats */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Account Statistics" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="600">
                      {user.usage_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI Requests Used
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="600">
                      {user.usage_limit || 10}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily Limit
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="600">
                      {Math.round(((user.usage_limit || 10) - (user.usage_count || 0)) / (user.usage_limit || 10) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color="primary" fontWeight="600">
                      {user.subscription_tier?.toUpperCase() || 'FREE'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}