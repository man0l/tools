import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { authTokens } = useContext(AuthContext);

  return authTokens && authTokens.access_token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
