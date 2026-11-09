import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      const res = await authService.login(credentials);
      const token = res.data.token || res.data.data?.token;
      const userData = res.data.token ? res.data.data : (res.data.data?.user || res.data.data);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${userData?.name || 'User'}!`);
      return userData;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (error.message?.includes('Network') || error.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server. Please make sure the backend is running on port 5000.'
          : 'Login failed. Please check credentials or ensure backend is running.');
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      const token = res.data.token || res.data.data?.token;
      const userObj = res.data.token ? res.data.data : (res.data.data?.user || res.data.data);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return userObj;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

