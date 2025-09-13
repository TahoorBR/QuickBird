"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Divider,
  Container,
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from "@mui/material";
import { 
  Settings,
  Notifications,
  Security,
  Palette,
  Language,
  Currency,
  Save,
  Delete,
  Edit,
  Add
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const { mode, toggleMode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    // Theme settings
    theme: mode,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    invoiceAlerts: true,
    
    // General settings
    language: 'en',
    currency: 'PKR',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Privacy settings
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    
    // AI settings
    aiSuggestions: true,
    autoComplete: true,
    smartCategorization: true
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSettingChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement> | any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoadingSettings(true);
      // In a real app, you would call an API to save settings
      // await apiClient.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      theme: 'light',
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      invoiceAlerts: true,
      language: 'en',
      currency: 'PKR',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      aiSuggestions: true,
      autoComplete: true,
      smartCategorization: true
    });
    toast.success('Settings reset to defaults');
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
          Please log in to view settings
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="600" sx={{ mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your QuickBird experience.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Appearance"
              avatar={<Palette />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.theme === 'dark'}
                    onChange={() => {
                      toggleMode();
                      setSettings(prev => ({
                        ...prev,
                        theme: prev.theme === 'dark' ? 'light' : 'dark'
                      }));
                    }}
                  />
                }
                label="Dark Mode"
              />
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={handleSettingChange('language')}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ur">اردو</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Currency & Region"
              avatar={<Currency />}
            />
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={settings.currency}
                  onChange={handleSettingChange('currency')}
                  label="Currency"
                >
                  <MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                  <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  onChange={handleSettingChange('timezone')}
                  label="Timezone"
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="Asia/Karachi">Asia/Karachi (PKT)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                  <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Notifications"
              avatar={<Notifications />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingChange('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={handleSettingChange('pushNotifications')}
                  />
                }
                label="Push Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.taskReminders}
                    onChange={handleSettingChange('taskReminders')}
                  />
                }
                label="Task Reminders"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.projectUpdates}
                    onChange={handleSettingChange('projectUpdates')}
                  />
                }
                label="Project Updates"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.invoiceAlerts}
                    onChange={handleSettingChange('invoiceAlerts')}
                  />
                }
                label="Invoice Alerts"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* AI Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="AI Features"
              avatar={<Settings />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.aiSuggestions}
                    onChange={handleSettingChange('aiSuggestions')}
                  />
                }
                label="AI Suggestions"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoComplete}
                    onChange={handleSettingChange('autoComplete')}
                  />
                }
                label="Auto Complete"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smartCategorization}
                    onChange={handleSettingChange('smartCategorization')}
                  />
                }
                label="Smart Categorization"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Privacy & Security"
              avatar={<Security />}
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Profile Visibility</InputLabel>
                    <Select
                      value={settings.profileVisibility}
                      onChange={handleSettingChange('profileVisibility')}
                      label="Profile Visibility"
                    >
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="contacts">Contacts Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataSharing}
                        onChange={handleSettingChange('dataSharing')}
                      />
                    }
                    label="Allow Data Sharing for Analytics"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={handleResetSettings}
                  color="error"
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={loadingSettings}
                  startIcon={<Save />}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}