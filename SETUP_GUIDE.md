# Flexify - On-Demand Job Hiring Platform Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Flexify-master

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/flexify

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# Client Configuration
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Atlas (cloud) - just update MONGO_URI in .env
```

### 4. Run the Application

```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
cd client
npm run dev
```

### 5. Access the Application

- **Client**: http://localhost:5173
- **Server**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🔧 Fixed Issues

### ✅ Provider Registration
- Fixed provider registration API endpoint
- Added proper data validation
- Fixed database saving issues

### ✅ Password Visibility
- Added password toggle buttons to all forms
- Enhanced user experience with show/hide functionality

### ✅ Authentication & Tokens
- Fixed JWT token handling
- Added proper token validation
- Fixed login/logout flow

### ✅ Dashboard Creation
- Created user dashboard with booking management
- Created provider dashboard with booking handling
- Created admin dashboard with verification system

### ✅ Booking System
- Fixed booking creation and management
- Added proper status tracking
- Implemented provider acceptance/rejection flow

## 📱 User Flows

### User Registration & Login
1. Navigate to `/register/user`
2. Fill in details and create account
3. Login at `/login/user`
4. Access dashboard at `/dashboard/user`

### Provider Registration & Login
1. Navigate to `/register/provider`
2. Complete multi-step registration
3. Login at `/login/provider`
4. Access dashboard at `/dashboard/provider`

### Admin Access
1. Login at `/login/admin`
2. Access admin dashboard at `/dashboard/admin`
3. Verify pending providers

### Service Booking
1. Browse services at `/services`
2. Create booking at `/booking`
3. Track bookings at `/bookings`

## 🛠️ API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Providers
- `GET /api/v1/providers/me` - Get provider profile
- `PUT /api/v1/providers/profile/me` - Update provider profile
- `GET /api/v1/providers/search/nearby` - Search nearby providers

### Bookings
- `POST /api/v1/bookings/create` - Create new booking
- `GET /api/v1/bookings/me` - Get user bookings
- `GET /api/v1/bookings/provider/me` - Get provider bookings
- `PATCH /api/v1/bookings/:id/accept` - Accept booking
- `PATCH /api/v1/bookings/:id/reject` - Reject booking

### Admin
- `GET /api/v1/admin/providers/pending` - Get pending providers
- `POST /api/v1/admin/providers/:id/verify` - Verify provider
- `POST /api/v1/admin/providers/:id/reject` - Reject provider

## 🎨 Features

### User Features
- ✅ User registration and login
- ✅ Service browsing and booking
- ✅ Booking management and tracking
- ✅ Provider rating and review

### Provider Features
- ✅ Provider registration with verification
- ✅ Profile management and portfolio upload
- ✅ Booking acceptance/rejection
- ✅ Earnings tracking

### Admin Features
- ✅ Provider verification system
- ✅ Platform statistics
- ✅ User and provider management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration

## 📦 Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- Modern CSS with custom properties

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Zod for validation

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_ORIGIN=https://your-domain.com
```

### Build Commands

```bash
# Build server
cd server
npm run build

# Build client
cd client
npm run build
```

## 📞 Support

For any issues or questions:
1. Check the console logs for errors
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check network connectivity

## 🎉 Success!

Your Flexify platform is now ready for launch! Users can register, providers can sign up, and bookings can be managed through the admin dashboard.
