import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  });
  const [user, setUser] = useState(() => {
    if (authTokens) {
      return authTokens.userId;
    }
    return null;
  });

  const loginUser = async (identifier, password) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        identifier,
        password
      });
      setAuthTokens(response.data);
      setUser(response.data.userId);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response.data);
      return { success: false, message: error.response.data.error };
    }
  };

  const signupUser = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/signup', {
        username,
        email,
        password
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Signup failed:', error.response.data);
      return { success: false, message: error.response.data.error };
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${authTokens.refresh_token}`
        }
      });
      const newTokens = {
        access_token: response.data.access_token,
        refresh_token: authTokens.refresh_token,
        userId: user
      };
      setAuthTokens(newTokens);
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
    } catch (error) {
      console.error('Token refresh failed:', error.response.data);
      logoutUser();
    }
  };

  useEffect(() => {
    if (authTokens) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // Refresh every 14 minutes
      return () => clearInterval(interval);
    }
  }, [authTokens]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    signupUser,
    logoutUser,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
