import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, X, Check, AlertCircle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { appointmentService } from '../services/api';
import { toast } from 'react-toastify';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'upcoming') {
        params.upcoming = 'true';
      } else if (filter !== 'all') {
        params.status = filter;
      }
      
      const data = await appointmentService.getAll(params);
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentService.cancel(selectedAppointment.id, cancelReason);
      toast.success('Rendez-vous annulé');
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setCancelReason('');
      loadAppointments();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', label: 'En attente' },
      confirmed: { class: 'badge-success', label: 'Confirmé' },
      cancelled: { class: 'badge-error', label: 'Annulé' },
      completed: { class: 'badge-info', label: 'Terminé' },
      no_show: { class: 'badge-error', label: 'Absent' }
    };
    return badges[status] || { class: '', label: status };
  };

  const canCancel = (appointment) => {
    if (appointment.status !== 'confirmed' && appointment.status !== 'pending') {
      return false;
    }
    const appointmentDate = parseISO(appointment.date);
    return !isPast(appointmentDate) || isToday(appointmentDate);
  };

  return (
    <main id="main-content" className="appointments-page">
      <div className="appointments-container">
        <header className="appointments-header">
          <h1>Mes rendez-vous</h1>
          <Link to="/search" className="btn btn-primary">
            <Calendar size={18} />
            Nouveau rendez-vous
          </Link>
        </header>

        {/* Filtres */}
        <div className="appointments-filters" role="tablist">
          {[
            { value: 'upcoming', label: 'À venir' },
            { value: 'completed', label: 'Passés' },
            { value: 'cancelled', label: 'Annulés' },
            { value: 'all', label: 'Tous' }
          ].map(f => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              className={`filter-btn ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste des rendez-vous */}
        {loading ? (
          <div className="page-loader">
            <div className="loader" aria-label="Chargement"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state card">
            <Calendar size={48} className="empty-icon" />
            <h2>Aucun rendez-vous</h2>
            <p>Vous n'avez pas de rendez-vous {filter === 'upcoming' ? 'à venir' : filter === 'completed' ? 'passés' : filter === 'cancelled' ? 'annulés' : ''}.</p>
            <Link to="/search" className="btn btn-primary">
              Prendre rendez-vous
            </Link>
          </div>
        ) : (
          <ul className="appointments-list" role="list">
            {appointments.map(appointment => {
              const status = getStatusBadge(appointment.status);
              const appointmentDate = parseISO(appointment.date);
              const isUpcoming = !isPast(appointmentDate) || isToday(appointmentDate);

              return (
                <li key={appointment.id} className="appointment-card card">
                  <div className="appointment-date-col">
                    <span className="date-day">
                      {format(appointmentDate, 'd', { locale: fr })}
                    </span>
                    <span className="date-month">
                      {format(appointmentDate, 'MMM', { locale: fr })}
                    </span>
                    <span className="date-year">
                      {format(appointmentDate, 'yyyy')}
                    </span>
                  </div>

                  <div className="appointment-info">
                    <div className="appointment-header">
                      <h2>{appointment.practitioner.fullName}</h2>
                      <span className={`badge ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    <p className="appointment-specialty">
                      {appointment.practitioner.specialty}
                    </p>

                    <div className="appointment-details">
                      <div className="detail">
                        <Clock size={16} aria-hidden="true" />
                        <span>{appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}</span>
                      </div>
                      <div className="detail">
                        {appointment.type === 'teleconsultation' ? (
                          <>
                            <Video size={16} aria-hidden="true" />
                            <span>Téléconsultation</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={16} aria-hidden="true" />
                            <span>{appointment.practitioner.address}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {appointment.reason && (
                      <p className="appointment-reason">
                        <strong>Motif :</strong> {appointment.reason}
                      </p>
                    )}
                  </div>

                  <div className="appointment-actions">
                    {canCancel(appointment) && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleCancelClick(appointment)}
                      >
                        <X size={16} />
                        Annuler
                      </button>
                    )}
                    {isUpcoming && appointment.type === 'teleconsultation' && appointment.status === 'confirmed' && (
                      <button className="btn btn-primary btn-sm">
                        <Video size={16} />
                        Rejoindre
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Modal d'annulation */}
        {cancelModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <div className="modal">
              <div className="modal-header">
                <h2 id="cancel-title">Annuler le rendez-vous</h2>
                <button
                  className="modal-close"
                  onClick={() => setCancelModalOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="alert alert-warning">
                  <AlertCircle size={20} />
                  <span>Cette action est irréversible</span>
                </div>

                <p>
                  Êtes-vous sûr de vouloir annuler votre rendez-vous avec{' '}
                  <strong>{selectedAppointment?.practitioner.fullName}</strong> le{' '}
                  <strong>
                    {selectedAppointment && format(parseISO(selectedAppointment.date), 'd MMMM yyyy', { locale: fr })}
                  </strong>{' '}
                  à <strong>{selectedAppointment?.startTime.slice(0, 5)}</strong> ?
                </p>

                <div className="form-group mt-lg">
                  <label htmlFor="cancel-reason" className="form-label">
                    Motif d'annulation (optionnel)
                  </label>
                  <textarea
                    id="cancel-reason"
                    className="form-textarea"
                    rows={3}
                    placeholder="Indiquez le motif de votre annulation..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCancelModalOpen(false)}
                >
                  Retour
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                >
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Appointments;
