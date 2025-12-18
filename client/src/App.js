import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Shared Profile Page
import Profile from './pages/Admin/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import DustbinManagement from './pages/Admin/DustbinManagement';
import WorkerManagement from './pages/Admin/WorkerManagement';
import ReportsManagement from './pages/Admin/ReportsManagement';
import UnacceptedAlerts from './pages/Admin/UnacceptedAlerts';

// Worker Pages
import WorkerDashboard from './pages/Worker/Dashboard';
import MyAlerts from './pages/Worker/MyAlerts';
import ActiveTasks from './pages/Worker/ActiveTasks';
import Leaderboard from './pages/Worker/Leaderboard';

// User Pages
import UserDashboard from './pages/User/Dashboard';
import ReportIssue from './pages/User/ReportIssue';
import MyReports from './pages/User/MyReports';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dustbins"
              element={
                <ProtectedRoute role="Admin">
                  <DustbinManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workers"
              element={
                <ProtectedRoute role="Admin">
                  <WorkerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute role="Admin">
                  <ReportsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/unaccepted-alerts"
              element={
                <ProtectedRoute role="Admin">
                  <UnacceptedAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute role="Admin">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Worker Routes */}
            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute role="Worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/alerts"
              element={
                <ProtectedRoute role="Worker">
                  <MyAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/tasks"
              element={
                <ProtectedRoute role="Worker">
                  <ActiveTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/leaderboard"
              element={
                <ProtectedRoute role="Worker">
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/profile"
              element={
                <ProtectedRoute role="Worker">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute role="User">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/report-issue"
              element={
                <ProtectedRoute role="User">
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-reports"
              element={
                <ProtectedRoute role="User">
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute role="User">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;