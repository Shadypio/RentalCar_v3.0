import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { DirectionsCar, People, Assignment } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="lg">
          <div className="hero-content">
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to RentalCar
            </Typography>
            <Typography variant="h5" paragraph>
              Find and rent your perfect car for any occasion
            </Typography>
            {!isAuthenticated() ? (
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{ px: 4, py: 1.5, color: 'white', borderColor: 'white' }}
                >
                  Login
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/cars"
                sx={{ px: 4, py: 1.5, mt: 2 }}
              >
                Browse Cars
              </Button>
            )}
          </div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          What We Offer
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need for your car rental experience
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <DirectionsCar sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Wide Selection
                </Typography>
                <Typography color="text.secondary">
                  Choose from a variety of cars including economy, luxury, and specialty vehicles
                </Typography>
              </CardContent>
              {isAuthenticated() && (
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button component={Link} to="/cars">
                    View Cars
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Easy Management
                </Typography>
                <Typography color="text.secondary">
                  Simple registration and profile management for all your rental needs
                </Typography>
              </CardContent>
              {isAuthenticated() && (
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button component={Link} to="/profile">
                    My Profile
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>

          {isAuthenticated() && isAdmin() && <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <Assignment sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Rental Tracking
                </Typography>
                <Typography color="text.secondary">
                  Complete rental management system for administrators
                </Typography>
              </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button component={Link} to="/rentals">
                    Manage Rentals
                  </Button>
                </CardActions>
            </Card>
          </Grid>}
        </Grid>
      </Container>

      {/* Call to Action */}
      {!isAuthenticated() && (
        <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 6 }}>
          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" paragraph>
              Join thousands of satisfied customers who trust RentalCar
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ 
                mt: 2, 
                px: 4, 
                py: 1.5,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Register Now
            </Button>
          </Container>
        </Box>
      )}
    </>
  );
};

export default Home;
