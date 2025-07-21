# Rental Car Management System - React & Node.js

A modern full-stack rental car management system built with React.js frontend and Node.js backend, featuring user authentication, role-based access control, and comprehensive CRUD operations.

## 🚀 Features

- **User Authentication**: JWT-based authentication with login/register
- **Role-Based Access**: Customer and Admin roles with different permissions
- **Car Management**: Browse, search, and filter available cars
- **Rental System**: Complete rental booking and management
- **Customer Management**: Admin panel for customer management
- **Responsive Design**: Mobile-friendly Material-UI interface
- **Real-time Data**: React Query for optimized data fetching

## 🛠️ Tech Stack

### Frontend
- **React.js 18.2.0** - Modern React with hooks and functional components
- **Material-UI 5.14.20** - Professional component library
- **React Router 6.8.1** - Client-side routing
- **React Query 3.39.3** - Data fetching and caching
- **React Hook Form 7.43.0** - Form validation and handling
- **Axios 1.3.4** - HTTP client for API calls

### Backend
- **Node.js & Express 4.18.2** - RESTful API server
- **Sequelize 6.35.1** - MySQL ORM
- **JWT** - Authentication tokens
- **bcryptjs 2.4.3** - Password hashing
- **MySQL 8.0+** - Database

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rental-car-react
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables
1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Update `.env` with your configuration:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rental_car_db
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secure_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
```

#### Setup Database
1. Create MySQL database:
```sql
CREATE DATABASE rental_car_db;
```

2. Start the backend server:
```bash
npm start
```

The server will automatically:
- Sync database models
- Create default roles (CUSTOMER, ADMIN)
- Create default admin user (username: `admin`, password: `admin123`)
- Seed sample car data

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Usage

### Default Credentials
- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`

### User Roles

#### Customer
- Browse available cars
- View car details
- Create rental bookings
- Manage profile

#### Admin
- All customer features
- Manage cars (add, edit, delete)
- Manage customers
- View all rentals
- Full system administration

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   ├── Cars/
│   │   │   ├── CarCard.js
│   │   │   ├── CarDialog.js
│   │   │   └── CarFilters.js
│   │   ├── Customers/
│   │   │   └── CustomerTable.js
│   │   ├── Rentals/
│   │   │   └── RentalTable.js
│   │   └── ProtectedRoute.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Cars.js
│   │   ├── Profile.js
│   │   ├── Customers.js
│   │   └── Rentals.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── theme.js
│   ├── App.js
│   └── index.js
```

### Backend Structure
```
backend/
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Car.js
│   ├── Customer.js
│   ├── Rental.js
│   ├── Role.js
│   └── index.js
├── routes/
│   ├── auth.js
│   ├── cars.js
│   ├── customers.js
│   ├── rentals.js
│   └── roles.js
└── server.js
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Create car (Admin only)
- `PUT /api/cars/:id` - Update car (Admin only)
- `DELETE /api/cars/:id` - Delete car (Admin only)

### Customers
- `GET /api/customers` - Get all customers (Admin only)
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin only)

### Rentals
- `GET /api/rentals` - Get rentals (filtered by user role)
- `POST /api/rentals` - Create rental
- `PUT /api/rentals/:id` - Update rental
- `DELETE /api/rentals/:id` - Delete rental

### Roles
- `GET /api/roles` - Get all roles

## 🚨 Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm start  # React development server
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- CORS configuration
- Input validation and sanitization

## 🎨 UI/UX Features

- Responsive Material-UI design
- Dark/Light theme support
- Loading states and error handling
- Toast notifications
- Form validation
- Search and filtering
- Pagination for large datasets

## 🧪 Testing

The application includes sample data and comprehensive error handling for testing different scenarios.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.
