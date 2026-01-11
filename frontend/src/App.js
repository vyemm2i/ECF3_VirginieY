import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './hooks/useAuth';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPage from './pages/Search';
import PractitionerDetail from './pages/PractitionerDetail';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';

// Styles
import './styles/global.css';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" aria-label="Chargement"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route pour utilisateurs non connectés
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" aria-label="Chargement"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout principal
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

// Footer
const Footer = () => (
  <footer className="footer" role="contentinfo">
    <div className="container">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">🏥 MediBook</span>
          <p>Prenez rendez-vous avec votre médecin en ligne, 24h/24.</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>À propos</h4>
            <ul>
              <li><a href="/about">Qui sommes-nous</a></li>
              <li><a href="/careers">Carrières</a></li>
              <li><a href="/press">Presse</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Aide</h4>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/accessibility">Accessibilité</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Légal</h4>
            <ul>
              <li><a href="/terms">CGU</a></li>
              <li><a href="/privacy">Confidentialité</a></li>
              <li><a href="/cookies">Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 MediBook - HealthTech Solutions. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/practitioners/:id" element={<Layout><PractitionerDetail /></Layout>} />

            {/* Routes pour utilisateurs non connectés */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } />

            {/* Routes protégées */}
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Layout><Appointments /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <Layout>
                <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                  <h1>Page non trouvée</h1>
                  <p>La page que vous recherchez n'existe pas.</p>
                  <a href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Retour à l'accueil
                  </a>
                </main>
              </Layout>
            } />
          </Routes>
          <Footer />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
