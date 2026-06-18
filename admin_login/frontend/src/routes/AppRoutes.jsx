import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import AddBus from "../pages/AddBus";
import BusList from "../pages/BusList";
import UpdateBus from "../pages/UpdateBus";
import DeleteBus from "../pages/DeleteBus";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-bus" element={<AddBus />} />
        <Route path="/buses" element={<BusList />} />
        <Route path="/update-bus/:id" element={<UpdateBus />} />
        <Route path="/delete-bus" element={<DeleteBus />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
