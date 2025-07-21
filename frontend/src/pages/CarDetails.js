import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Delete, CarRental } from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { carsAPI, rentalsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import CarForm from '../components/Cars/CarForm';
import RentalForm from '../components/Rentals/RentalForm';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);

  const { data: car, isLoading, error, refetch } = useQuery(
    ['car', id],
    () => carsAPI.getById(id),
    {
      select: (response) => response.data,
    }
  );

  const deleteMutation = useMutation(carsAPI.delete, {
    onSuccess: () => {
      enqueueSnackbar('Car deleted successfully!', { variant: 'success' });
      navigate('/cars');
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete car',
        { variant: 'error' }
      );
    },
  });

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id);
    setShowDeleteDialog(false);
  };

  const handleRent = () => {
    setShowRentalForm(true);
  };

  const handleCarUpdated = () => {
    setShowEditForm(false);
    refetch();
  };

  const handleRentalCreated = () => {
    setShowRentalForm(false);
    enqueueSnackbar('Car rented successfully!', { variant: 'success' });
    navigate('/cars');
  };

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
          Failed to load car details. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Car not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Car Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 400,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '8rem',
              }}
            >
              🚗
            </Box>
          </Grid>

          {/* Car Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom>
              {car.brand} {car.model}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                label={car.category} 
                color="primary" 
                size="large"
                sx={{ mb: 2 }}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  License Plate
                </Typography>
                <Typography variant="h6">
                  {car.licensePlate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Year
                </Typography>
                <Typography variant="h6">
                  {car.year}
                </Typography>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {!isAdmin() && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CarRental />}
                  onClick={handleRent}
                  sx={{ flex: 1, minWidth: 200 }}
                >
                  Rent This Car
                </Button>
              )}
              
              {isAdmin() && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Car Features/Description */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Features
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This {car.brand} {car.model} ({car.year}) is available for rent. 
            It's a {car.category.toLowerCase()} vehicle perfect for your transportation needs.
          </Typography>
        </Box>
      </Paper>

      {/* Edit Car Form */}
      {showEditForm && (
        <CarForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={handleCarUpdated}
          car={car}
        />
      )}

      {/* Rental Form */}
      {showRentalForm && (
        <RentalForm
          open={showRentalForm}
          onClose={() => setShowRentalForm(false)}
          onSuccess={handleRentalCreated}
          car={car}
          customer={user}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this car? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarDetails;
