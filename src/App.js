import React from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import FileList from './components/FileList';
import UploadPDF from './components/UploadPDF';
import TranslationList from './components/TranslationList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cream">
        <Header />
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 1444:px-10">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/upload-pdf" element={<UploadPDF />} />
            <Route path="/file-list" element={<FileList />} />
            <Route path="/translation-list" element={<TranslationList />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
