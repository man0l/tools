import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAxios = () => {
  const { authTokens, logoutUser, refreshToken } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      Authorization: authTokens ? `Bearer ${authTokens.access_token}` : ''
    }
  });

  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry && authTokens?.refresh_token) {
        originalRequest._retry = true;
        await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${authTokens.access_token}`;
        return axiosInstance(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
