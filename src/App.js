import React from 'react';
import './App.css';
import UploadPDF from './components/UploadPDF';
import logo from './logo.svg';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <header className="bg-dark-gray text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <img src={logo} className="h-10" alt="logo" />
          <nav>
            <a href="#" className="text-light-blue hover:text-light-gray mx-2">Home</a>
            <a href="#" className="text-light-blue hover:text-light-gray mx-2">Upload PDF</a>
            <a href="#" className="text-light-blue hover:text-light-gray mx-2">Book Contents</a>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4 text-center text-dark-blue">Welcome to the App</h1>
        <UploadPDF />
      </main>
      <footer className="bg-dark-gray text-white p-4">
        <div className="container mx-auto text-center">
          &copy; 2023 Your Company
        </div>
      </footer>
    </div>
  );
}

export default App;
