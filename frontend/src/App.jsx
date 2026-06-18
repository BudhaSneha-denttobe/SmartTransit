import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminProtectedRoute from './components/admin/ProtectedRoute';
import AdminMainLayout from './components/admin/MainLayout';
import AdminToast from './components/admin/Toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BusStops from './pages/BusStops';
import TrackBus from './pages/TrackBus';
import Weather from './pages/Weather';
import Assistant from './pages/Assistant';
import Emergency from './pages/Emergency';
import RoutePlanner from './pages/RoutePlanner';
import AdminDashboard from './pages/admin/Dashboard';
import ManageRoutes from './pages/admin/ManageRoutes';
import ManageStops from './pages/admin/ManageStops';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBuses from './pages/admin/ManageBuses';

import AdminLogin from './pages/admin-portal/AdminLogin';
import AdminPortalDashboard from './pages/admin-portal/AdminDashboard';
import AddBus from './pages/admin-portal/AddBus';
import BusList from './pages/admin-portal/BusList';
import UpdateBus from './pages/admin-portal/UpdateBus';
import DeleteBusPage from './pages/admin-portal/DeleteBus';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected */}
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="stops" element={<ProtectedRoute><BusStops /></ProtectedRoute>} />
        <Route path="track-bus" element={<ProtectedRoute><TrackBus /></ProtectedRoute>} />
        <Route path="weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
        <Route path="emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="route-planner" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />

        {/* Admin Routes (GTFS Management) */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin/routes"
          element={
            <AdminRoute>
              <ManageRoutes />
            </AdminRoute>
          }
        />
        <Route
          path="admin/stops"
          element={
            <AdminRoute>
              <ManageStops />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />
        <Route
          path="admin/buses"
          element={
            <AdminRoute>
              <ManageBuses />
            </AdminRoute>
          }
        />
      </Route>

      {/* Admin Portal (Bus Management System) */}
      <Route path="/admin-login" element={
        <AdminAuthProvider>
          <AdminLogin />
          <AdminToast />
        </AdminAuthProvider>
      } />
      <Route
        path="/admin-portal"
        element={
          <AdminAuthProvider>
            <AdminProtectedRoute>
              <AdminMainLayout />
            </AdminProtectedRoute>
          </AdminAuthProvider>
        }
      >
        <Route index element={<AdminPortalDashboard />} />
        <Route path="dashboard" element={<AdminPortalDashboard />} />
        <Route path="add-bus" element={<AddBus />} />
        <Route path="buses" element={<BusList />} />
        <Route path="update-bus/:id" element={<UpdateBus />} />
        <Route path="delete-bus" element={<DeleteBusPage />} />
      </Route>
    </Routes>
  );
}
