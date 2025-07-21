import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { carsAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const CarForm = ({ open, onClose, onSuccess, car = null }) => {
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const isEditing = !!car;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: car || {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      category: 'Automobile',
    },
  });

  const createMutation = useMutation(carsAPI.create, {
    onSuccess: () => {
      enqueueSnackbar('Car added successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to add car');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => carsAPI.update(id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Car updated successfully!', { variant: 'success' });
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update car');
      },
    }
  );

  const onSubmit = (data) => {
    setError('');
    const carData = {
      ...data,
      year: parseInt(data.year),
    };

    if (isEditing) {
      updateMutation.mutate({ id: car.id, data: carData });
    } else {
      createMutation.mutate(carData);
    }
  };

  const categories = ['Automobile', 'Commerciale', 'Camper'];
  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Car' : 'Add New Car'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Plate"
                {...register('licensePlate', {
                  required: 'License plate is required',
                })}
                error={!!errors.licensePlate}
                helperText={errors.licensePlate?.message}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                {...register('brand', {
                  required: 'Brand is required',
                })}
                error={!!errors.brand}
                helperText={errors.brand?.message}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                {...register('model', {
                  required: 'Model is required',
                })}
                error={!!errors.model}
                helperText={errors.model?.message}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Year"
                {...register('year', {
                  required: 'Year is required',
                  min: {
                    value: 1900,
                    message: 'Year must be at least 1900',
                  },
                  max: {
                    value: new Date().getFullYear() + 1,
                    message: 'Year cannot be in the future',
                  },
                })}
                error={!!errors.year}
                helperText={errors.year?.message}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Category"
                {...register('category', {
                  required: 'Category is required',
                })}
                error={!!errors.category}
                helperText={errors.category?.message}
                disabled={isLoading}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              isEditing ? 'Update' : 'Add Car'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CarForm;
