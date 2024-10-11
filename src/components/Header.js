import React from 'react';
import logo from '../logo.svg';

function Header() {
  return (
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
  );
}

export default Header;
