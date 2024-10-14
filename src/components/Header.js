import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg';

function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <img src={logo} className="h-10" alt="logo" />
        <nav className="flex space-x-4">
          <Link to="/" className="text-blue-300 hover:text-gray-300">Home</Link>
          <Link to="/upload-pdf" className="text-blue-300 hover:text-gray-300">Upload PDF</Link>          
          <Link to="/file-list" className="text-blue-300 hover:text-gray-300">File List</Link>
          <Link to="/translation-list" className="text-blue-300 hover:text-gray-300">Translation List</Link>
          <Link to="/prompt-manager" className="text-blue-300 hover:text-gray-300">Prompt Manager</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
