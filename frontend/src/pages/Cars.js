import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { carsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CarForm from '../components/Cars/CarForm';

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: cars, isLoading, error, refetch } = useQuery(
    'cars',
    carsAPI.getAll,
    {
      select: (response) => response.data,
    }
  );

  const filteredCars = cars?.filter((car) => {
    const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Automobile', 'Commerciale', 'Camper'];

  const handleViewDetails = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const handleCarAdded = () => {
    setShowAddForm(false);
    refetch();
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
          Failed to load cars. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box className="page-header">
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Available Cars
          </Typography>
          <Typography variant="h6" align="center">
            Find your perfect rental car
          </Typography>
        </Container>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search cars..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Category"
              variant="outlined"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredCars?.length || 0} cars found
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Cars Grid */}
      <Grid container spacing={3} className="car-grid">
        {filteredCars?.map((car) => (
          <Grid item xs={12} sm={6} md={4} key={car.id}>
            <Card className="car-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '3rem',
                }}
              >
                🚗
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {car.brand} {car.model}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  License Plate: {car.licensePlate}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Year: {car.year}
                </Typography>
                <Chip 
                  label={car.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => handleViewDetails(car.id)}
                  variant="contained"
                  fullWidth
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCars?.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No cars found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Add Car FAB for Admin */}
      {isAdmin() && (
        <Fab
          color="primary"
          aria-label="add car"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setShowAddForm(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Add Car Form Dialog */}
      {showAddForm && (
        <CarForm
          open={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleCarAdded}
        />
      )}
    </Container>
  );
};

export default Cars;
