import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiService.getToken();
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Restore user data from localStorage
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        apiService.clearToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      
      if (response.success) {
        apiService.setToken(response.token);
        // Use the real user data from the backend response
        setUser(response.user);
        // Persist user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (username, name, email, password, confirmPassword) => {
    try {
      const response = await apiService.register(username, name, email, password, confirmPassword);
      
      if (response.success) {
        apiService.setToken(response.token);
        // Use the real user data from the backend response
        setUser(response.user);
        // Persist user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};