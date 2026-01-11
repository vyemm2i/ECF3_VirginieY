import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, Shield, Clock, Users } from 'lucide-react';
import { specialtyService } from '../services/api';
import './Home.css';

const Home = () => {
  const [specialties, setSpecialties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data.specialties.slice(0, 8));
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('specialty', searchQuery);
    if (searchCity) params.set('city', searchCity);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <main id="main-content" className="home">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title" className="hero-title">
            Prenez rendez-vous avec un professionnel de santé
          </h1>
          <p className="hero-subtitle">
            Trouvez un médecin près de chez vous et réservez en ligne, 24h/24
          </p>

          {/* Formulaire de recherche */}
          <form className="search-form" onSubmit={handleSearch} role="search">
            <div className="search-input-group">
              <label htmlFor="search-specialty" className="sr-only">
                Spécialité ou nom du praticien
              </label>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" aria-hidden="true" />
                <input
                  id="search-specialty"
                  type="text"
                  className="search-input"
                  placeholder="Spécialité, praticien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="search-input-group">
              <label htmlFor="search-city" className="sr-only">
                Ville
              </label>
              <div className="search-input-wrapper">
                <MapPin size={20} className="search-icon" aria-hidden="true" />
                <input
                  id="search-city"
                  type="text"
                  className="search-input"
                  placeholder="Où ? (ville)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg search-btn">
              <Search size={20} aria-hidden="true" />
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Spécialités populaires */}
      <section className="specialties-section" aria-labelledby="specialties-title">
        <div className="container">
          <h2 id="specialties-title" className="section-title">
            Spécialités les plus recherchées
          </h2>
          
          <div className="specialties-grid">
            {specialties.map((specialty) => (
              <Link
                key={specialty.id}
                to={`/search?specialty=${encodeURIComponent(specialty.name)}`}
                className="specialty-card"
              >
                <div className="specialty-icon" aria-hidden="true">
                  {getSpecialtyEmoji(specialty.name)}
                </div>
                <h3 className="specialty-name">{specialty.name}</h3>
                <p className="specialty-count">
                  {specialty.practitionerCount} praticien{specialty.practitionerCount > 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="features-section" aria-labelledby="features-title">
        <div className="container">
          <h2 id="features-title" className="section-title">
            Pourquoi choisir MediBook ?
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={32} aria-hidden="true" />
              </div>
              <h3>Réservation 24h/24</h3>
              <p>Prenez rendez-vous à tout moment, même en dehors des heures d'ouverture</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={32} aria-hidden="true" />
              </div>
              <h3>Gain de temps</h3>
              <p>Plus d'attente au téléphone, réservez en quelques clics</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Star size={32} aria-hidden="true" />
              </div>
              <h3>Avis vérifiés</h3>
              <p>Consultez les avis des patients pour choisir votre praticien</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} aria-hidden="true" />
              </div>
              <h3>Données sécurisées</h3>
              <p>Vos informations personnelles sont protégées et confidentielles</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} aria-hidden="true" />
              </div>
              <h3>Téléconsultation</h3>
              <p>Consultez certains praticiens à distance depuis chez vous</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={32} aria-hidden="true" />
              </div>
              <h3>Praticiens proches</h3>
              <p>Trouvez facilement des professionnels près de chez vous</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-content">
            <h2 id="cta-title">Prêt à prendre soin de votre santé ?</h2>
            <p>Créez votre compte gratuitement et prenez votre premier rendez-vous</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Créer un compte
              </Link>
              <Link to="/search" className="btn btn-outline btn-lg">
                Rechercher un praticien
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// Helper pour les emojis de spécialités
const getSpecialtyEmoji = (name) => {
  const emojis = {
    'Médecin généraliste': '👨‍⚕️',
    'Dermatologue': '🧴',
    'Cardiologue': '❤️',
    'Ophtalmologue': '👁️',
    'Dentiste': '🦷',
    'Kinésithérapeute': '💪',
    'Psychologue': '🧠',
    'Pédiatre': '👶',
    'Gynécologue': '🩺',
    'ORL': '👂'
  };
  return emojis[name] || '🏥';
};

export default Home;
