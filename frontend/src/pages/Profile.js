import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Avatar,
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person, Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation } from 'react-query';
import { customersAPI, rentalsAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });

  // Fetch user's rentals
  const { data: rentals, isLoading: rentalsLoading } = useQuery(
    ['userRentals', user?.id],
    () => rentalsAPI.getByCustomer(user.id),
    {
      enabled: !!user?.id,
      select: (response) => response.data,
    }
  );

  const updateMutation = useMutation(
    (data) => customersAPI.update(user.id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
        setIsEditing(false);
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to update profile',
          { variant: 'error' }
        );
      },
    }
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {user?.role?.roleName || 'USER'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {isEditing ? (
              <Box component="form" noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleChange}
                      disabled={updateMutation.isLoading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={editData.lastName}
                      onChange={handleChange}
                      disabled={updateMutation.isLoading}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? <CircularProgress size={20} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={updateMutation.isLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    First Name
                  </Typography>
                  <Typography variant="body1">
                    {user?.firstName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Name
                  </Typography>
                  <Typography variant="body1">
                    {user?.lastName}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1">
                    {user?.dateOfBirth ? 
                      format(new Date(user.dateOfBirth), 'MMMM dd, yyyy') : 
                      'Not specified'
                    }
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Rental History */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Rentals
            </Typography>

            {rentalsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : rentals && rentals.length > 0 ? (
              <Box>
                {rentals.map((rental) => (
                  <Box
                    key={rental.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {rental.rentedCar?.brand} {rental.rentedCar?.model}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      License: {rental.rentedCar?.licensePlate}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {format(new Date(rental.startDate), 'MMM dd, yyyy')} - {' '}
                      {format(new Date(rental.endDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info">
                You haven't made any rentals yet.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
