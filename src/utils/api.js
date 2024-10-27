import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useApi = () => {
  const { api, refreshToken, logoutUser } = useContext(AuthContext);

  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          logoutUser();
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default useApi;
