import React from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import FileList from './components/FileList';
import UploadPDF from './components/UploadPDF';
import TranslationList from './components/TranslationList';
import PromptManager from './components/PromptManager';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-cream">
          <Header />
          <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 1444:px-10">
            <ToastContainer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={
                <PrivateRoute>
                  <MainContent />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/upload-pdf" element={
                <PrivateRoute>
                  <UploadPDF />
                </PrivateRoute>
              } />
              <Route path="/file-list" element={
                <PrivateRoute>
                  <FileList />
                </PrivateRoute>
              } />
              <Route path="/translation-list" element={
                <PrivateRoute>
                  <TranslationList />
                </PrivateRoute>
              } />
              <Route path="/prompt-manager" element={
                <PrivateRoute>
                  <PromptManager />
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
