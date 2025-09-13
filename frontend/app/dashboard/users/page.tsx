"use client";

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
  TextField,
  Fab,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Container,
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
  People as PeopleIcon,
  Add,
  Search,
  Edit,
  Delete,
  Person,
  Email,
  CalendarToday,
  Security,
  ArrowBack
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient, Client } from "@/lib/api";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    setMounted(true);
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientsData = await apiClient.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleCreateClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newClient = await apiClient.createClient(clientData);
      setClients(prev => [...prev, newClient]);
      setShowCreateDialog(false);
      toast.success('Client created successfully');
    } catch (error) {
      console.error('Failed to create client:', error);
      toast.error('Failed to create client');
    }
  };

  const handleEditClient = async (client: Client) => {
    setEditingClient(client);
    setShowEditDialog(true);
  };

  const handleUpdateClient = async (clientData: Partial<Client>) => {
    if (!editingClient) return;
    
    try {
      const updatedClient = await apiClient.updateClient(editingClient.id, clientData);
      setClients(prev => prev.map(c => c.id === editingClient.id ? updatedClient : c));
      setShowEditDialog(false);
      setEditingClient(null);
      toast.success('Client updated successfully');
    } catch (error) {
      console.error('Failed to update client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiClient.deleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
        toast.success('Client deleted successfully');
      } catch (error) {
        console.error('Failed to delete client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  if (!mounted || loading || loadingClients) {
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
          Please log in to view clients
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: clients.length,
    active: clients.length, // All clients are considered active for now
  };

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            component={Link}
            href="/dashboard"
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="bold">
            Clients
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your client relationships and contact information
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
                Total Clients
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
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Clients
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Search and Add */}
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
              placeholder="Search clients..."
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
              New Client
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon />
              <Typography variant="h6" fontWeight="600">
                All Clients ({filteredClients.length})
              </Typography>
            </Box>
          }
        />
        <CardContent>
          {filteredClients.length > 0 ? (
            <List>
              {filteredClients.map((client, index) => (
                <Box key={client.id}>
                  <ListItem
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                      borderRadius: 2,
                      mb: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="600">
                            {client.name}
                          </Typography>
                          {client.company && (
                            <Chip
                              label={client.company}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Typography variant="body2" color="text.secondary">
                                {client.email}
                              </Typography>
                            </Box>
                            {client.phone && (
                              <Typography variant="body2" color="text.secondary">
                                {client.phone}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Added: {new Date(client.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={() => handleEditClient(client)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClient(client.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredClients.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No clients found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first client"}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setShowCreateDialog(true)}
              >
                Add Client
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

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateClient}
      />
      <EditClientDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingClient(null);
        }}
        onSubmit={handleUpdateClient}
        client={editingClient}
      />
    </Container>
  );
}

// Create Client Dialog Component
const CreateClientDialog = ({ 
  open, 
  onClose, 
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      phone: formData.phone || undefined,
      is_active: formData.is_active
    });
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      is_active: true
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Client</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Client Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Company (optional)"
            fullWidth
            variant="outlined"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Phone (optional)"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add Client</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Edit Client Dialog Component
const EditClientDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  client
}: { 
  open: boolean;
  onClose: () => void;
  onSubmit: (clientData: Partial<Client>) => void;
  client: Client | null;
}) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    address: client?.address || '',
    notes: client?.notes || '',
    is_active: client?.is_active ?? true
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        notes: client.notes || '',
        is_active: client.is_active
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Client</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Company"
            fullWidth
            variant="outlined"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Update Client</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
