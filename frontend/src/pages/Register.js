import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions générales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        acceptTerms: 'true'
      });
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <main id="main-content" className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-wide">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span>🏥</span> MediBook
            </Link>
            <h1>Créer un compte</h1>
            <p>Rejoignez MediBook pour prendre vos rendez-vous en ligne</p>
          </div>

          {errors.general && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={20} aria-hidden="true" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Prénom *
                </label>
                <div className="input-with-icon">
                  <User size={20} className="input-icon" aria-hidden="true" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Jean"
                    value={formData.firstName}
                    onChange={handleChange}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                </div>
                {errors.firstName && (
                  <p id="firstName-error" className="form-error">{errors.firstName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nom *
                </label>
                <div className="input-with-icon">
                  <User size={20} className="input-icon" aria-hidden="true" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={handleChange}
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                </div>
                {errors.lastName && (
                  <p className="form-error">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email *
              </label>
              <div className="input-with-icon">
                <Mail size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="jean.dupont@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Téléphone
              </label>
              <div className="input-with-icon">
                <Phone size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe *
              </label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby="password-requirements"
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
              
              {/* Password strength meter */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`strength-bar ${level <= passwordStrength.strength ? `strength-${passwordStrength.strength}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label strength-${passwordStrength.strength}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              
              <p id="password-requirements" className="form-hint">
                8 caractères minimum, une majuscule, un chiffre, un caractère spécial
              </p>
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe *
              </label>
              <div className="input-with-icon">
                <Lock size={20} className="input-icon" aria-hidden="true" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle size={20} className="input-icon-right text-success" aria-label="Les mots de passe correspondent" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  aria-invalid={errors.acceptTerms ? 'true' : 'false'}
                />
                <span>
                  J'accepte les{' '}
                  <Link to="/terms" target="_blank">conditions générales d'utilisation</Link>
                  {' '}et la{' '}
                  <Link to="/privacy" target="_blank">politique de confidentialité</Link> *
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="form-error">{errors.acceptTerms}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader loader-sm" aria-hidden="true"></span>
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
