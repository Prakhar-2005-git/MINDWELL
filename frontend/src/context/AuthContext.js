import React, { createContext, useState, useEffect } from 'react';
import api from '../service/api';

const AuthContext = createContext();

// Helper function to parse JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
        // On refresh, we only have the ID from the token.
        setUser({ id: decodedToken.id });
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (email, password, recoveryKeyword) => {
    try {
      const response = await api.post('/auth/register', { email, password, recoveryKeyword });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData); 
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const recoverPassword = async (email, recoveryKeyword, newPassword) => {
    try {
      const response = await api.post('/auth/recover', { email, recoveryKeyword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Password recovery failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, recoverPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
