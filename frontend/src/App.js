import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BreathingTool from './components/features/BreathingTool';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Support from './pages/Support';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/support" element={<Support />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/your-breath" element={<BreathingTool />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
