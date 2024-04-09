import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header>
      {/* Hamburger Icon */}
      <div onClick={toggleMenu}>☰</div>

      {/* Menu Panel */}
      {isOpen && (
        <nav style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200px',
          height: '100%',
          backgroundColor: '#fff',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '20px'
        }}>
          {/* Menu Items */}
          <Link to="/" onClick={toggleMenu}>Home</Link>
          <Link to="/profile" onClick={toggleMenu}>Profile</Link>
          <Link to="/chat" onClick={toggleMenu}>Chat</Link>
          <Link to="/items" onClick={toggleMenu}>Items</Link>
          {/* Add more links as needed */}
        </nav>
      )}
    </header>
  );
};

export default HamburgerMenu;
