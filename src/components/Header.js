import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.svg';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <nav className="flex items-center justify-center space-x-8">
          <Link to="/" className="text-blue-300 hover:text-gray-300">Home</Link>
          <Link to="/upload-pdf" className="text-blue-300 hover:text-gray-300">Upload PDF</Link>          
          <Link to="/file-list" className="text-blue-300 hover:text-gray-300">File List</Link>
          <Link to="/translation-list" className="text-blue-300 hover:text-gray-300">Translation List</Link>
          <Link to="/prompt-manager" className="text-blue-300 hover:text-gray-300">Prompt Manager</Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-blue-300 hover:text-gray-300 flex items-center"
            >
              Account
              <svg 
                className={`ml-1 h-4 w-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-blue-300 hover:bg-gray-700"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-blue-300 hover:bg-gray-700"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }} 
                  className="block w-full text-left px-4 py-2 text-red-300 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
