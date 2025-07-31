// src/context/AuthContext.js
import jwtDecode from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authApi';
import {
  loginSuccess,
  logout as logoutAction,
  tokenRefreshed,
} from '../store/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Check if token is expired
          const decoded = jwtDecode(storedToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            // Attempt to refresh token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              try {
                const newToken = await refreshToken(refreshToken);
                dispatch(tokenRefreshed({ token: newToken }));
                const userData = await getCurrentUser(newToken);
                dispatch(loginSuccess({ user: userData, token: newToken }));
              } catch (error) {
                dispatch(logoutAction());
              }
            } else {
              dispatch(logoutAction());
            }
          } else {
            // Token is valid, fetch user data
            const userData = await getCurrentUser(storedToken);
            dispatch(
              loginSuccess({
                user: userData,
                token: storedToken,
                refreshToken: localStorage.getItem('refreshToken'),
              }),
            );
          }
        } catch (error) {
          dispatch(logoutAction());
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      const { user, token, refreshToken } = await loginUser(email, password);
      dispatch(loginSuccess({ user, token, refreshToken }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const { user, token } = await registerUser(userData);
      dispatch(loginSuccess({ user, token }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutAction());
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
