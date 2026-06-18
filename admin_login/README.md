# Smart Transit - Admin Management System

A production-ready MERN stack application for managing a transportation agency's bus fleet.

## Tech Stack

**Frontend:** React.js, React Router DOM, Axios, Tailwind CSS, Context API, React Icons, React Hot Toast

**Backend:** Node.js, Express.js, MongoDB with Mongoose, JWT Authentication, bcrypt

## Features

- Admin Authentication (Register/Login) with JWT
- Role-Based Access Control (RBAC)
- Dashboard with Statistics
- Bus CRUD Operations (Add, View, Update, Delete)
- Search & Filter Buses
- Pagination
- Responsive Design

## Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd admin_login
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (already provided):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_transit
JWT_SECRET=smarttransitsecret
```

Seed the database with sample employee and bus records:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The API will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`.

## Seed Data

The `npm run seed` command creates:

### Employee Records (for registration verification)

| Employee ID | Name | Email |
|-------------|------|-------|
| EMP001 | Rajesh Kumar | rajesh.kumar@transport.gov |
| EMP002 | Priya Sharma | priya.sharma@transport.gov |
| EMP003 | Amit Patel | amit.patel@transport.gov |
| EMP004 | Sunita Reddy | sunita.reddy@transport.gov |
| EMP005 | Vikram Singh | vikram.singh@transport.gov |

### Bus Records (sample data - 8 buses)

## API Endpoints

### Admin
- `POST /api/admin/register` - Register new admin
- `POST /api/admin/login` - Login admin
- `GET /api/admin/profile` - Get admin profile (Protected)

### Buses
- `POST /api/buses/add` - Add new bus (Protected)
- `GET /api/buses` - Get all buses with search & filter (Protected)
- `GET /api/buses/:id` - Get bus by ID (Protected)
- `GET /api/buses/number/:busNumber` - Get bus by number (Protected)
- `PUT /api/buses/:id` - Update bus (Protected)
- `DELETE /api/buses/:id` - Delete bus (Protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Protected)

## Project Structure

```
admin_login/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── busController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Bus.js
│   │   └── Employee.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── busRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── AddBus.jsx
│   │   │   ├── BusList.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DeleteBus.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UpdateBus.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── busService.js
│   │   │   └── dashboardService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```
