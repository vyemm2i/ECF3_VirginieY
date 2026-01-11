import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter, Video, ChevronRight } from 'lucide-react';
import { practitionerService, specialtyService } from '../services/api';
import './Search.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [practitioners, setPractitioners] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [filters, setFilters] = useState({
    specialty: searchParams.get('specialty') || '',
    city: searchParams.get('city') || '',
    name: searchParams.get('name') || '',
    teleconsultation: searchParams.get('teleconsultation') === 'true',
    acceptsNew: searchParams.get('acceptsNew') === 'true'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSpecialties();
  }, []);

  useEffect(() => {
    loadPractitioners();
  }, [searchParams]);

  const loadSpecialties = async () => {
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data.specialties);
    } catch (error) {
      console.error('Erreur chargement spécialités:', error);
    }
  };

  const loadPractitioners = async () => {
    setLoading(true);
    try {
      const params = {
        specialty: searchParams.get('specialty'),
        city: searchParams.get('city'),
        name: searchParams.get('name'),
        teleconsultation: searchParams.get('teleconsultation'),
        acceptsNew: searchParams.get('acceptsNew'),
        page: searchParams.get('page') || 1,
        limit: 10
      };

      const data = await practitionerService.search(params);
      setPractitioners(data.practitioners);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
        aria-hidden="true"
      />
    ));
  };

  return (
    <main id="main-content" className="search-page">
      <div className="search-container">
        {/* Sidebar Filters */}
        <aside className={`search-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="sidebar-header">
            <h2>Filtres</h2>
            <button
              className="close-filters"
              onClick={() => setShowFilters(false)}
              aria-label="Fermer les filtres"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSearch} className="filter-form">
            <div className="filter-group">
              <label htmlFor="specialty" className="filter-label">
                Spécialité
              </label>
              <select
                id="specialty"
                name="specialty"
                className="form-select"
                value={filters.specialty}
                onChange={handleFilterChange}
              >
                <option value="">Toutes les spécialités</option>
                {specialties.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="city" className="filter-label">
                Ville
              </label>
              <div className="input-with-icon">
                <MapPin size={18} className="input-icon" aria-hidden="true" />
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Paris"
                  value={filters.city}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="name" className="filter-label">
                Nom du praticien
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Rechercher par nom"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="teleconsultation"
                  checked={filters.teleconsultation}
                  onChange={handleFilterChange}
                />
                <span>Téléconsultation disponible</span>
              </label>
            </div>

            <div className="filter-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="acceptsNew"
                  checked={filters.acceptsNew}
                  onChange={handleFilterChange}
                />
                <span>Accepte nouveaux patients</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <Search size={18} aria-hidden="true" />
              Rechercher
            </button>
          </form>
        </aside>

        {/* Results */}
        <section className="search-results" aria-label="Résultats de recherche">
          <div className="results-header">
            <h1>
              {pagination.total} praticien{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
            </h1>
            <button
              className="filter-toggle"
              onClick={() => setShowFilters(true)}
              aria-label="Afficher les filtres"
            >
              <Filter size={20} />
              Filtres
            </button>
          </div>

          {loading ? (
            <div className="page-loader">
              <div className="loader" aria-label="Chargement"></div>
            </div>
          ) : practitioners.length === 0 ? (
            <div className="no-results">
              <p>Aucun praticien trouvé avec ces critères.</p>
              <p>Essayez de modifier vos filtres de recherche.</p>
            </div>
          ) : (
            <>
              <ul className="practitioners-list" role="list">
                {practitioners.map(practitioner => (
                  <li key={practitioner.id}>
                    <Link
                      to={`/practitioners/${practitioner.id}`}
                      className="practitioner-card"
                    >
                      <div className="practitioner-avatar">
                        {practitioner.firstName.charAt(0)}{practitioner.lastName.charAt(0)}
                      </div>

                      <div className="practitioner-info">
                        <h2 className="practitioner-name">
                          {practitioner.fullName}
                        </h2>
                        <p className="practitioner-specialty">
                          {practitioner.specialty.name}
                        </p>
                        <p className="practitioner-address">
                          <MapPin size={14} aria-hidden="true" />
                          {practitioner.address.city}
                        </p>

                        <div className="practitioner-meta">
                          <div className="practitioner-rating" aria-label={`Note: ${practitioner.rating} sur 5`}>
                            {renderStars(practitioner.rating)}
                            <span>{practitioner.rating.toFixed(1)}</span>
                            <span className="review-count">({practitioner.totalReviews} avis)</span>
                          </div>

                          {practitioner.teleconsultationAvailable && (
                            <span className="badge badge-info">
                              <Video size={12} aria-hidden="true" />
                              Téléconsultation
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="practitioner-action">
                        <span className="practitioner-price">
                          {practitioner.consultationPrice}€
                        </span>
                        <ChevronRight size={20} aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button
                    className="pagination-btn"
                    disabled={pagination.page === 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', pagination.page - 1);
                      setSearchParams(params);
                    }}
                  >
                    Précédent
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', pagination.page + 1);
                      setSearchParams(params);
                    }}
                  >
                    Suivant
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default SearchPage;
