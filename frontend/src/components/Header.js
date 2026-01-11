import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Menu, 
  X, 
  User, 
  Calendar, 
  LogOut, 
  Bell,
  Search,
  Home
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo" aria-label="MediBook - Accueil">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">MediBook</span>
        </Link>

        {/* Navigation principale */}
        <nav className="header-nav" role="navigation" aria-label="Navigation principale">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">
                <Home size={18} aria-hidden="true" />
                <span>Accueil</span>
              </Link>
            </li>
            <li>
              <Link to="/search" className="nav-link">
                <Search size={18} aria-hidden="true" />
                <span>Rechercher</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/appointments" className="nav-link">
                  <Calendar size={18} aria-hidden="true" />
                  <span>Mes rendez-vous</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Actions utilisateur */}
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button 
                className="header-icon-btn"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="notification-badge" aria-label="2 nouvelles notifications">2</span>
              </button>

              {/* Menu utilisateur */}
              <div className="user-menu-container">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu utilisateur"
                >
                  <div className="user-avatar">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <span className="user-name">{user?.firstName}</span>
                </button>

                {userMenuOpen && (
                  <div className="user-menu" role="menu">
                    <div className="user-menu-header">
                      <p className="user-menu-name">{user?.firstName} {user?.lastName}</p>
                      <p className="user-menu-email">{user?.email}</p>
                    </div>
                    <div className="user-menu-divider" />
                    <Link 
                      to="/profile" 
                      className="user-menu-item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={18} />
                      Mon profil
                    </Link>
                    <Link 
                      to="/appointments" 
                      className="user-menu-item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Calendar size={18} />
                      Mes rendez-vous
                    </Link>
                    <div className="user-menu-divider" />
                    <button 
                      className="user-menu-item user-menu-logout"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Inscription
              </Link>
            </div>
          )}

          {/* Bouton menu mobile */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="mobile-menu" role="navigation" aria-label="Menu mobile">
          <nav>
            <ul>
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
              </li>
              <li>
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Rechercher</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/appointments" onClick={() => setMobileMenuOpen(false)}>Mes rendez-vous</Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Mon profil</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Déconnexion</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Inscription</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
