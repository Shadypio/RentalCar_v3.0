import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation } from 'react-query';
import { rentalsAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const Rentals = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { data: rentals, isLoading, error, refetch } = useQuery(
    'rentals',
    rentalsAPI.getAll,
    {
      select: (response) => response.data,
    }
  );

  const deleteMutation = useMutation(rentalsAPI.delete, {
    onSuccess: () => {
      enqueueSnackbar('Rental deleted successfully!', { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete rental',
        { variant: 'error' }
      );
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this rental?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) {
      return 'info'; // Future
    } else if (today >= start && today <= end) {
      return 'success'; // Active
    } else {
      return 'default'; // Completed
    }
  };

  const getStatusText = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start) {
      return 'Upcoming';
    } else if (today >= start && today <= end) {
      return 'Active';
    } else {
      return 'Completed';
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 200,
      valueGetter: (params) => 
        `${params.row.referredCustomer?.firstName || ''} ${params.row.referredCustomer?.lastName || ''}`.trim() || 'N/A',
    },
    {
      field: 'car',
      headerName: 'Car',
      width: 200,
      valueGetter: (params) => 
        `${params.row.rentedCar?.brand || ''} ${params.row.rentedCar?.model || ''}`.trim() || 'N/A',
    },
    {
      field: 'licensePlate',
      headerName: 'License Plate',
      width: 150,
      valueGetter: (params) => params.row.rentedCar?.licensePlate || 'N/A',
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 150,
      valueFormatter: (params) => {
        return params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '';
      },
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 150,
      valueFormatter: (params) => {
        return params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '';
      },
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 120,
      valueGetter: (params) => {
        if (params.row.startDate && params.row.endDate) {
          const start = new Date(params.row.startDate);
          const end = new Date(params.row.endDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        }
        return 'N/A';
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.row.startDate, params.row.endDate)}
          color={getStatusColor(params.row.startDate, params.row.endDate)}
          size="small"
        />
      ),
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
          Failed to load rentals. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box className="page-header">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Rental Management
          </Typography>
          <Typography variant="h6" align="center">
            Monitor all car rentals
          </Typography>
        </Container>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Rentals ({rentals?.length || 0})
        </Typography>
        
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rentals || []}
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

      {/* Summary Cards */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Rental Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h4" color="primary">
              {rentals?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Rentals
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h4" color="success.main">
              {rentals?.filter(r => {
                const today = new Date();
                const start = new Date(r.startDate);
                const end = new Date(r.endDate);
                return today >= start && today <= end;
              }).length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Rentals
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="h4" color="info.main">
              {rentals?.filter(r => {
                const today = new Date();
                const start = new Date(r.startDate);
                return today < start;
              }).length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Rentals
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Rentals;
