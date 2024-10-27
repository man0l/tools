import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const api = axios.create({
  baseURL: `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`,
});

const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  });
  const [user, setUser] = useState(() => {
    return authTokens ? authTokens.userId : null;
  });

  const setAuthHeader = useCallback((token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  useEffect(() => {
    if (authTokens) {
      setAuthHeader(authTokens.access_token);
    }
  }, [authTokens, setAuthHeader]);

  const loginUser = useCallback(async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      setAuthTokens(response.data);
      setUser(response.data.userId);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      setAuthHeader(response.data.access_token);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data);
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  }, [setAuthHeader]);

  const signupUser = useCallback(async (username, email, password) => {
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Signup failed:', error.message);
      return { success: false, message: error.response?.data?.error || 'Signup failed' };
    }
  }, []);

  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    setAuthHeader(null);
  }, [setAuthHeader]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: authTokens.refresh_token
      });
      const newTokens = {
        access_token: response.data.access_token,
        refresh_token: authTokens.refresh_token,
        userId: user
      };
      setAuthTokens(newTokens);
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
      setAuthHeader(newTokens.access_token);
      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data);
      logoutUser();
      return null;
    }
  }, [authTokens, user, setAuthHeader, logoutUser]);

  useEffect(() => {
    if (authTokens) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes
      return () => clearInterval(interval);
    }
  }, [authTokens, refreshToken]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    signupUser,
    logoutUser,
    refreshToken,
    api
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
