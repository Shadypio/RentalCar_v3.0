import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Customers from './pages/Customers';
import Rentals from './pages/Rentals';
import Profile from './pages/Profile';
import AdminRoute from './components/Auth/AdminRoute';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/cars" element={
            <ProtectedRoute>
              <Cars />
            </ProtectedRoute>
          } />
          
          <Route path="/cars/:id" element={
            <ProtectedRoute>
              <CarDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="/customers" element={
            <AdminRoute>
              <Customers />
            </AdminRoute>
          } />
          
          <Route path="/rentals" element={
            <AdminRoute>
              <Rentals />
            </AdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
