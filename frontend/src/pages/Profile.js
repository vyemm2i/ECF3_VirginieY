import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Lock, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService, userService } from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfileData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : '',
        gender: data.user.gender || '',
        address: data.user.address || '',
        city: data.user.city || '',
        postalCode: data.user.postalCode || ''
      });
    } catch (error) {
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = await userService.updateProfile(profileData);
      updateUser(data.user);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setSaving(true);

    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Mot de passe modifié');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" aria-label="Chargement"></div>
      </div>
    );
  }

  return (
    <main id="main-content" className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="profile-title">
            <h1>{user?.firstName} {user?.lastName}</h1>
            <p>{user?.email}</p>
          </div>
        </header>

        <div className="profile-content">
          {/* Tabs */}
          <nav className="profile-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'info'}
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <User size={18} />
              Informations
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'security'}
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              Sécurité
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content card">
            {activeTab === 'info' && (
              <form onSubmit={handleProfileSubmit}>
                <h2>Informations personnelles</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">Prénom</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="form-input"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Nom</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="form-input"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={profileData.email}
                    disabled
                  />
                  <p className="form-hint">L'adresse email ne peut pas être modifiée</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Téléphone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="06 12 34 56 78"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">Date de naissance</label>
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      className="form-input"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">Genre</label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-select"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="">Non renseigné</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <h3>Adresse</h3>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">Adresse</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    placeholder="12 rue de la Paix"
                    value={profileData.address}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">Ville</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="form-input"
                      placeholder="Paris"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="postalCode" className="form-label">Code postal</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      className="form-input"
                      placeholder="75001"
                      value={profileData.postalCode}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="loader loader-sm"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit}>
                <h2>Changer le mot de passe</h2>

                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Mot de passe actuel
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <p className="form-hint">
                    8 caractères minimum, une majuscule, un chiffre, un caractère spécial
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="loader loader-sm"></span>
                      Modification...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Modifier le mot de passe
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
