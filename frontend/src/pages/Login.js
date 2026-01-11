import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span>🏥</span> MediBook
            </Link>
            <h1>Connexion</h1>
            <p>Accédez à votre espace personnel</p>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={20} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  aria-describedby="email-hint"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="form-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader loader-sm" aria-hidden="true"></span>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register">Créer un compte</Link>
            </p>
          </div>

          {/* Comptes de test */}
          <div className="test-accounts">
            <p className="test-accounts-title">Comptes de test :</p>
            <ul>
              <li><strong>Patient :</strong> jean.dupont@email.com / Password123!</li>
              <li><strong>Praticien :</strong> dr.martin@medibook.fr / Password123!</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
