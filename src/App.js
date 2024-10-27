import React from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import FileList from './components/FileList';
import UploadPDF from './components/UploadPDF';
import TranslationList from './components/TranslationList';
import PromptManager from './components/PromptManager';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import AuthProvider from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-cream">
          <Header />
          <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 1444:px-10">
            <Routes>
              <Route path="/" element={<PrivateRoute><MainContent /></PrivateRoute>} />
              <Route path="/upload-pdf" element={<PrivateRoute><UploadPDF /></PrivateRoute>} />
              <Route path="/file-list" element={<PrivateRoute><FileList /></PrivateRoute>} />
              <Route path="/translation-list" element={<PrivateRoute><TranslationList /></PrivateRoute>} />
              <Route path="/prompt-manager" element={<PrivateRoute><PromptManager /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
