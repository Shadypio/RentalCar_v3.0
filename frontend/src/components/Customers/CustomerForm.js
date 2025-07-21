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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { customersAPI, rolesAPI } from '../../services/api';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const CustomerForm = ({ open, onClose, onSuccess, customer = null }) => {
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const isEditing = !!customer;

  const { data: roles } = useQuery('roles', rolesAPI.getAll, {
    select: (response) => response.data,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: customer || {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      dateOfBirth: null,
      roleId: 2, // Default to regular user role
    },
  });

  const createMutation = useMutation(customersAPI.create, {
    onSuccess: () => {
      enqueueSnackbar('Customer added successfully!', { variant: 'success' });
      reset();
      onSuccess();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to add customer');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => customersAPI.update(id, data),
    {
      onSuccess: () => {
        enqueueSnackbar('Customer updated successfully!', { variant: 'success' });
        onSuccess();
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update customer');
      },
    }
  );

  const onSubmit = (data) => {
    setError('');
    const customerData = {
      ...data,
      dateOfBirth: data.dateOfBirth.format('YYYY-MM-DD'),
    };

    if (isEditing) {
      updateMutation.mutate({ id: customer.id, data: customerData });
    } else {
      createMutation.mutate(customerData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
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
                  label="First Name"
                  {...register('firstName', {
                    required: 'First name is required',
                  })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('lastName', {
                    required: 'Last name is required',
                  })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  {...register('username', {
                    required: 'Username is required',
                  })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  {...register('roleId', {
                    required: 'Role is required',
                  })}
                  error={!!errors.roleId}
                  helperText={errors.roleId?.message}
                  disabled={isLoading}
                >
                  {roles?.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: 'Date of birth is required' }}
                  render={({ field }) => (
                    <DatePicker
                      label="Date of Birth"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      maxDate={dayjs().subtract(18, 'year')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dateOfBirth,
                          helperText: errors.dateOfBirth?.message,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              
              {!isEditing && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading}
                  />
                </Grid>
              )}
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
                isEditing ? 'Update' : 'Add Customer'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CustomerForm;
