import React, { useContext } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ScrollBrain from '../ScrollBrain';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  const handleNavigation = (path) => (event) => {
    event.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">Mind<span>Well</span><i /></Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/" end onClick={handleNavigation('/')}>Home</NavLink>
          <NavLink to="/dashboard" onClick={handleNavigation('/dashboard')}>Dashboard</NavLink>
          <NavLink to="/your-breath" onClick={handleNavigation('/your-breath')}>YourBreath</NavLink>
          <NavLink to="/support" onClick={handleNavigation('/support')}>Support</NavLink>
        </nav>
        <div className="nav-actions">
          {user ? <button className="text-button" onClick={handleLogout}>Log out</button> : <><Link className="text-button" to="/login">Log in</Link><Link className="button button-small" to="/register">Register</Link></>}
        </div>
      </header>
      <main><Outlet /><ScrollBrain /></main>
      <footer className="site-footer">
        <div><Link className="brand footer-brand" to="/">Mind<span>Well</span><i /></Link><p>A private place to pause, reflect, and care for your mind.</p></div>
        <div><h3>Explore</h3><Link to="/dashboard">Dashboard</Link><Link to="/your-breath">YourBreath</Link><Link to="/support">Support</Link></div>
        <div><h3>A gentle reminder</h3><p>You do not have to have all the answers today.</p><small>© {new Date().getFullYear()} MindWell</small></div>
      </footer>
    </div>
  );
};

export default Layout;
