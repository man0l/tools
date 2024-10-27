import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../logo.svg';

function Header() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <img src={logo} className="h-10" alt="logo" />
        <nav className="flex space-x-4">
          {user ? (
            <>
              <Link to="/" className="text-blue-300 hover:text-gray-300">Home</Link>
              <Link to="/upload-pdf" className="text-blue-300 hover:text-gray-300">Upload PDF</Link>          
              <Link to="/file-list" className="text-blue-300 hover:text-gray-300">File List</Link>
              <Link to="/translation-list" className="text-blue-300 hover:text-gray-300">Translation List</Link>
              <Link to="/prompt-manager" className="text-blue-300 hover:text-gray-300">Prompt Manager</Link>
              <Link to="/profile" className="text-blue-300 hover:text-gray-300">Profile</Link>
              <button onClick={logoutUser} className="text-blue-300 hover:text-gray-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-300 hover:text-gray-300">Login</Link>
              <Link to="/signup" className="text-blue-300 hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
