# SaaS Implementation Plan

## Table of Contents

1. [Backend Implementation](#backend-implementation)
   - [1.1. Install Required Packages](#11-install-required-packages)
   - [1.2. Create User Model](#12-create-user-model)
   - [1.3. Set Up Database Migrations](#13-set-up-database-migrations)
   - [1.4. Implement Authentication Routes](#14-implement-authentication-routes)
2. [Frontend Implementation](#frontend-implementation)
   - [2.1. Create Authentication Context](#21-create-authentication-context)
   - [2.2. Create API Client](#22-create-api-client)
   - [2.3. Build Signup and Login Pages](#23-build-signup-and-login-pages)
   - [2.4. Create PrivateRoute Component](#24-create-privateroute-component)
   - [2.5. Create User Profile Page](#25-create-user-profile-page)
   - [2.6. Update App Component](#26-update-app-component)
3. [Additional Considerations](#additional-considerations)
   - [3.1. Error Handling](#31-error-handling)
   - [3.2. Logout Functionality](#32-logout-functionality)

---

## Backend Implementation

### 1.1. Install Required Packages

Install the necessary packages for authentication and database management:

```bash
pip install Flask-JWT-Extended passlib
```

Update your `requirements.txt`:

```plaintext
Flask-JWT-Extended==4.4.4
passlib==1.7.4
```

### 1.2. Create User Model

Create a `User` model in `backend/models/user_model.py`:

```python
from datetime import datetime
from backend.models.database import db
from passlib.hash import bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)
```

### 1.3. Set Up Database Migrations

Run database migrations to include the new `User` model:

```bash
flask db migrate -m "Add User model"
flask db upgrade
```

### 1.4. Implement Authentication Routes

Create authentication routes in `backend/auth_handler.py`:

```python
from flask import Blueprint, request, jsonify
from backend.models.user_model import User
from backend.models.database import db
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    # Implementation for user signup

@auth_bp.route('/login', methods=['POST'])
def login():
    # Implementation for user login

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    # Implementation for token refresh
```

Register the `auth_bp` blueprint in `backend/app.py`:

```python
from backend.auth_handler import auth_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
```

---

## Frontend Implementation

### 2.1. Create Authentication Context

Create `src/context/AuthContext.js`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Implementation for login, signup, and logout functions

  const value = {
    user,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### 2.2. Create API Client

Create `src/utils/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
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

export { api };
```

### 2.3. Build Signup and Login Pages

Create `src/pages/Signup.js` and `src/pages/Login.js`:

```javascript
// src/pages/Signup.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Signup = () => {
  // Implementation for signup form
};

export default Signup;

// src/pages/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  // Implementation for login form
};

export default Login;
```

### 2.4. Create PrivateRoute Component

Create `src/components/PrivateRoute.js`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
```

### 2.5. Create User Profile Page

Create `src/pages/Profile.js`:

```javascript
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default Profile;
```

### 2.6. Update App Component

Update `src/App.js` to include the new routes and authentication context:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import FileList from './components/FileList';
import UploadPDF from './components/UploadPDF';
import TranslationList from './components/TranslationList';
import PromptManager from './components/PromptManager';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Implement routes with PrivateRoute for protected pages */}
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## Additional Considerations

### 3.1. Error Handling

Implement proper error handling in your API calls and display user-friendly error messages using react-toastify.

### 3.2. Logout Functionality

Ensure that the logout function in the AuthContext clears all user data and redirects to the login page.

---

This implementation plan provides a structure for adding authentication to your existing SaaS application. It uses JWT for authentication, React Context API for state management, and integrates with your existing components. Remember to test thoroughly and handle edge cases appropriately.
