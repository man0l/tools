import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.svg';

function Header() {
  return (
    <header className="bg-dark-gray text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <img src={logo} className="h-10" alt="logo" />
        <nav className="flex space-x-4">
          <Link to="/" className="text-light-blue hover:text-light-gray">Home</Link>
          <Link to="/upload-pdf" className="text-light-blue hover:text-light-gray">Upload PDF</Link>
          <Link to="/book-contents" className="text-light-blue hover:text-light-gray">Book Contents</Link>
          <Link to="/file-list" className="text-light-blue hover:text-light-gray">File List</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
