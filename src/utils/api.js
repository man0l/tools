import axios from 'axios';

const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;
const isDevelopment = process.env.NODE_ENV === 'development';
const domain = process.env.REACT_APP_DOMAIN || 'localhost';

const api = axios.create({
  baseURL: isDevelopment 
    ? `http://${domain}:${backendPort}`
    : `/api`,
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.access_token) {
      config.headers['Authorization'] = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.refresh_token) {
        try {
          const refreshUrl = isDevelopment
            ? `http://${domain}:${backendPort}/auth/refresh`
            : `/api/auth/refresh`;
            
          const res = await axios.post(
            refreshUrl,
            {
                refresh_token: user.refresh_token
            },
            {
              headers: {
                'Authorization': `Bearer ${user.refresh_token}`
              }
            }
          );
          if (res.status === 200) {
            user.access_token = res.data.access_token;
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${user.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api };
