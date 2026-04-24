import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import AdminPublication from './pages/AdminPublication';
import AdminLogin from './pages/AdminLogin';
import PostDetail from './pages/PostDetail';
import ForgotPassword from './pages/ForgotPassword';
import './index.css';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/admin/publication/:id" element={<AdminPublication />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
