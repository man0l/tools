import React from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

export default App;
