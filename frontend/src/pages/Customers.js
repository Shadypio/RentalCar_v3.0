import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation } from 'react-query';
import { customersAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import CustomerForm from '../components/Customers/CustomerForm';

const Customers = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { data: customers, isLoading, error, refetch } = useQuery(
    'customers',
    customersAPI.getAll,
    {
      select: (response) => response.data,
    }
  );

  const deleteMutation = useMutation(customersAPI.delete, {
    onSuccess: () => {
      enqueueSnackbar('Customer deleted successfully!', { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete customer',
        { variant: 'error' }
      );
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCustomerAdded = () => {
    setShowAddForm(false);
    refetch();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'username', headerName: 'Username', width: 150 },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      width: 150,
      valueFormatter: (params) => {
        return params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '';
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      valueGetter: (params) => params.row.role?.roleName || 'USER',
    },
    {
      field: 'enabled',
      headerName: 'Status',
      width: 120,
      valueFormatter: (params) => (params.value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
          disabled={deleteMutation.isLoading}
        >
          Delete
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load customers. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box className="page-header">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Customer Management
          </Typography>
          <Typography variant="h6" align="center">
            Manage all registered customers
          </Typography>
        </Container>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={customers || []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Add Customer FAB */}
      <Fab
        color="primary"
        aria-label="add customer"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowAddForm(true)}
      >
        <Add />
      </Fab>

      {/* Add Customer Form */}
      {showAddForm && (
        <CustomerForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleCustomerAdded}
        />
      )}
    </Container>
  );
};

export default Customers;
