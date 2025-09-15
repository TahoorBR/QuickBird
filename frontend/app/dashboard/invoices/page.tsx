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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Container
} from "@mui/material";
import { 
  Receipt as InvoiceIcon,
  Add,
  Edit,
  Delete,
  Print,
  Download,
  Send,
  AttachMoney,
  CalendarToday,
  Person,
  Work
} from "@mui/icons-material";
import { useAuth } from "@/hooks/use-auth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { apiClient, Invoice, InvoiceItem } from "@/lib/api";
import toast from "react-hot-toast";

const InvoiceCard = ({ invoice, onEdit, onDelete, onPrint, onSend }: { 
  invoice: Invoice; 
  onEdit: (invoice: Invoice) => void; 
  onDelete: (id: number) => void;
  onPrint: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'paid': return 'success';
      case 'overdue': return 'error';
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
              #{invoice.invoice_number}
            </Typography>
            <Chip
              label={invoice.status.toUpperCase()}
              color={getStatusColor(invoice.status) as any}
              variant="outlined"
              size="small"
            />
          </Box>
        }
        subheader={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              <Person sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {invoice.client_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Work sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {invoice.project_title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <CalendarToday sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
            </Typography>
          </Box>
        }
        action={
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton size="small" onClick={() => onPrint(invoice)} title="Print">
              <Print />
            </IconButton>
            <IconButton size="small" onClick={() => onSend(invoice)} title="Send">
              <Send />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(invoice)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(invoice.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            ${invoice.total_amount.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {invoice.items?.length || 0} items
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <Typography color="text.secondary">Subtotal:</Typography>
          <Typography>${invoice.subtotal.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <Typography color="text.secondary">Tax ({invoice.tax_rate}%):</Typography>
          <Typography>${invoice.tax_amount.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <Typography>Total:</Typography>
          <Typography>${invoice.total_amount.toFixed(2)}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function InvoicesPage() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadInvoices();
    loadProjects();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const invoicesData = await apiClient.getInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
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

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at'>) => {
    try {
      // Mock creation - replace with actual API call
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      setInvoices(prev => [...prev, newInvoice]);
      setShowCreateDialog(false);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleEditInvoice = async (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowEditDialog(true);
  };

  const handleUpdateInvoice = async (invoiceData: Partial<Invoice>) => {
    if (!editingInvoice) return;
    
    try {
      const updatedInvoice = await apiClient.updateInvoice(editingInvoice.id, invoiceData);
      setInvoices(prev => prev.map(inv => 
        inv.id === editingInvoice.id ? updatedInvoice : inv
      ));
      setShowEditDialog(false);
      setEditingInvoice(null);
      toast.success('Invoice updated successfully');
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintDialog(true);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await apiClient.sendInvoice(invoice.id);
      setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id ? { ...inv, status: 'sent' } : inv
      ));
      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  if (!mounted || loading || loadingInvoices) {
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
            Loading invoices...
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
          Please log in to view invoices.
        </Typography>
      </Box>
    );
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <InvoiceIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="bold">
            Invoices
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your invoices and billing
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Invoices
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {invoices.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Amount
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              ${totalAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Paid Amount
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ${paidAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Pending Amount
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              ${pendingAmount.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">
          All Invoices ({invoices.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Invoices Grid */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {invoices.map((invoice) => (
          <Box key={invoice.id} sx={{ flex: "1 1 350px", minWidth: "350px" }}>
            <InvoiceCard 
              invoice={invoice} 
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onPrint={handlePrintInvoice}
              onSend={handleSendInvoice}
            />
          </Box>
        ))}
      </Box>

      {invoices.length === 0 && (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <CardContent>
            <InvoiceIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No invoices yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first invoice to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Invoice
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

      {/* Create Invoice Dialog */}
      <CreateInvoiceDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateInvoice}
        projects={projects}
      />

      {/* Print Invoice Dialog */}
      <PrintInvoiceDialog
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        invoice={selectedInvoice}
      />
    </Container>
  );
}

// Create Invoice Dialog Component
const CreateInvoiceDialog = ({ 
  open, 
  onClose, 
  onSubmit,
  projects
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (invoice: Omit<Invoice, 'id' | 'created_at'>) => void;
  projects: any[];
}) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    client_name: '',
    client_email: '',
    project_title: '',
    amount: 0,
    tax_rate: 10,
    due_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tax_amount = (formData.amount * formData.tax_rate) / 100;
    const total_amount = formData.amount + tax_amount;
    
    onSubmit({
      ...formData,
      subtotal: formData.amount,
      tax_amount,
      total_amount,
      currency: 'PKR',
      is_recurring: false,
      status: 'draft',
      items: []
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Invoice</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Invoice Number"
            fullWidth
            variant="outlined"
            value={formData.invoice_number}
            onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Client Name"
            fullWidth
            variant="outlined"
            value={formData.client_name}
            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Client Email"
            fullWidth
            variant="outlined"
            type="email"
            value={formData.client_email}
            onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.project_title}
              onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.title}>
                  {project.title} - {project.client_name}
                </MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Tax Rate (%)"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.tax_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: Number(e.target.value) }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Due Date"
            fullWidth
            variant="outlined"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Invoice</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Print Invoice Dialog Component
const PrintInvoiceDialog = ({ 
  open, 
  onClose, 
  invoice
}: { 
  open: boolean; 
  onClose: () => void; 
  invoice: Invoice | null;
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Invoice #{invoice.invoice_number}</Typography>
          <Box>
            <Button startIcon={<Print />} onClick={handlePrint} sx={{ mr: 1 }}>
              Print
            </Button>
            <Button startIcon={<Download />} onClick={onClose}>
              Download PDF
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 4 }} id="invoice-content">
          {/* Invoice Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                QuickBird
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Professional Project Management
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h5" fontWeight="bold">
                INVOICE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                #{invoice.invoice_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {new Date(invoice.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {/* Client Info */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Bill To:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {invoice.client_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.client_email}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Due Date: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Project: {invoice.project_title}
              </Typography>
            </Box>
          </Box>

          {/* Invoice Items */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                    <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Invoice Totals */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${invoice.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography>Tax ({invoice.tax_rate}%):</Typography>
                <Typography>${invoice.tax_amount.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold">${invoice.total_amount.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Payment Info */}
          <Box sx={{ mt: 4, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Terms: Net 30 days
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thank you for your business!
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
