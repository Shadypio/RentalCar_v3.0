import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from 'react-query';
import { rentalsAPI } from '../../services/api';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const RentalForm = ({ open, onClose, onSuccess, car, customer }) => {
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      startDate: dayjs(),
      endDate: dayjs().add(1, 'day'),
    },
  });

  const watchStartDate = watch('startDate');

  const createMutation = useMutation(rentalsAPI.create, {
    onSuccess: () => {
      enqueueSnackbar('Rental created successfully!', { variant: 'success' });
      onSuccess();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create rental');
    },
  });

  const onSubmit = (data) => {
    setError('');
    
    // Validate dates
    if (data.endDate.isBefore(data.startDate)) {
      setError('End date must be after start date');
      return;
    }

    const rentalData = {
      startDate: data.startDate.format('YYYY-MM-DD'),
      endDate: data.endDate.format('YYYY-MM-DD'),
      customerId: customer.id,
      carId: car.id,
    };

    createMutation.mutate(rentalData);
  };

  const calculateDays = () => {
    const startDate = watchStartDate;
    const endDate = watch('endDate');
    if (startDate && endDate) {
      return endDate.diff(startDate, 'day') + 1;
    }
    return 0;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Rent Car - {car?.brand} {car?.model}
        </DialogTitle>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Car and Customer Info */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Car Details
                  </Typography>
                  <Typography variant="body2">
                    {car?.brand} {car?.model} ({car?.year})
                  </Typography>
                  <Typography variant="body2">
                    License: {car?.licensePlate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Customer
                  </Typography>
                  <Typography variant="body2">
                    {customer?.firstName} {customer?.lastName}
                  </Typography>
                  <Typography variant="body2">
                    Username: {customer?.username}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Date Selection */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={createMutation.isLoading}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="End Date"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={createMutation.isLoading}
                      minDate={watchStartDate || dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Rental Summary */}
            {calculateDays() > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                  Rental Summary
                </Typography>
                <Typography variant="body1" sx={{ color: 'primary.contrastText' }}>
                  Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={createMutation.isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                'Confirm Rental'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RentalForm;
