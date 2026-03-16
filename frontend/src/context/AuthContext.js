import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username,
        password
      });
      
      const { token, admin: adminData } = response.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      setIsAuthenticated(true);
      setAdmin(adminData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/register`, {
        username,
        password,
        email
      });
      
      const { token, admin: adminData } = response.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      setIsAuthenticated(true);
      setAdmin(adminData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}