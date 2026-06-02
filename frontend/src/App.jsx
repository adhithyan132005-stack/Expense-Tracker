import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import DashboardHome from './DashboardHome';
import ExpensesPage from './ExpensesPage';
import CategoriesPage from './CategoriesPage';
import AuthCallback from './AuthCallback'; // New import
import './App.css';

export default function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} /> {/* New route */}

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
