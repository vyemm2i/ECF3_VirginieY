import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Star, Calendar, Clock, 
  Video, Euro, ChevronLeft, ChevronRight, Check 
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { practitionerService, appointmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import './PractitionerDetail.css';

const PractitionerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [practitioner, setPractitioner] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in_person');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadPractitioner();
  }, [id]);

  useEffect(() => {
    if (practitioner) {
      loadSlots();
    }
  }, [practitioner, startDate]);

  const loadPractitioner = async () => {
    try {
      const data = await practitionerService.getById(id);
      setPractitioner(data.practitioner);
      setAvailability(data.availability);
      setReviews(data.reviews);
    } catch (error) {
      console.error('Erreur chargement praticien:', error);
      toast.error('Erreur lors du chargement du praticien');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    try {
      const endDate = addDays(startDate, 6);
      const data = await practitionerService.getSlots(id, {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      setSlots(data.slots);
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.info('Veuillez vous connecter pour prendre rendez-vous');
      navigate('/login', { state: { from: { pathname: `/practitioners/${id}` } } });
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error('Veuillez sélectionner une date et un créneau');
      return;
    }

    setBookingLoading(true);

    try {
      await appointmentService.create({
        practitionerId: id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        type: appointmentType,
        reason
      });

      toast.success('Rendez-vous confirmé !');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
        aria-hidden="true"
      />
    ));
  };

  const getDaysArray = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startDate, i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'EEE', { locale: fr }),
        dayNumber: format(date, 'd'),
        month: format(date, 'MMM', { locale: fr })
      };
    });
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" aria-label="Chargement"></div>
      </div>
    );
  }

  if (!practitioner) {
    return (
      <main className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1>Praticien non trouvé</h1>
        <button onClick={() => navigate('/search')} className="btn btn-primary mt-lg">
          Retour à la recherche
        </button>
      </main>
    );
  }

  const days = getDaysArray();

  return (
    <main id="main-content" className="practitioner-detail">
      <div className="detail-container">
        {/* Informations du praticien */}
        <section className="practitioner-header card">
          <div className="practitioner-main-info">
            <div className="practitioner-avatar-lg">
              {practitioner.firstName.charAt(0)}{practitioner.lastName.charAt(0)}
            </div>
            <div className="practitioner-text">
              <h1>{practitioner.fullName}</h1>
              <p className="specialty">{practitioner.specialty.name}</p>
              <div className="rating-display" aria-label={`Note: ${practitioner.rating} sur 5`}>
                {renderStars(practitioner.rating)}
                <span className="rating-value">{practitioner.rating.toFixed(1)}</span>
                <span className="rating-count">({practitioner.totalReviews} avis)</span>
              </div>
            </div>
          </div>

          <div className="practitioner-details">
            <div className="detail-item">
              <MapPin size={20} aria-hidden="true" />
              <span>{practitioner.address.street}, {practitioner.address.postalCode} {practitioner.address.city}</span>
            </div>
            {practitioner.phone && (
              <div className="detail-item">
                <Phone size={20} aria-hidden="true" />
                <span>{practitioner.phone}</span>
              </div>
            )}
            <div className="detail-item">
              <Euro size={20} aria-hidden="true" />
              <span>{practitioner.consultationPrice}€ / consultation</span>
            </div>
            <div className="detail-item">
              <Clock size={20} aria-hidden="true" />
              <span>{practitioner.consultationDuration} minutes</span>
            </div>
            {practitioner.teleconsultationAvailable && (
              <div className="detail-item badge-item">
                <Video size={20} aria-hidden="true" />
                <span>Téléconsultation disponible</span>
              </div>
            )}
          </div>

          {practitioner.bio && (
            <div className="practitioner-bio">
              <h2>À propos</h2>
              <p>{practitioner.bio}</p>
            </div>
          )}
        </section>

        {/* Réservation */}
        <section className="booking-section card" aria-labelledby="booking-title">
          <h2 id="booking-title">Prendre rendez-vous</h2>

          {/* Type de consultation */}
          {practitioner.teleconsultationAvailable && (
            <div className="appointment-type">
              <button
                className={`type-btn ${appointmentType === 'in_person' ? 'active' : ''}`}
                onClick={() => setAppointmentType('in_person')}
              >
                <MapPin size={18} />
                En cabinet
              </button>
              <button
                className={`type-btn ${appointmentType === 'teleconsultation' ? 'active' : ''}`}
                onClick={() => setAppointmentType('teleconsultation')}
              >
                <Video size={18} />
                Téléconsultation
              </button>
            </div>
          )}

          {/* Calendrier */}
          <div className="date-picker">
            <div className="date-navigation">
              <button
                className="nav-btn"
                onClick={() => setStartDate(addDays(startDate, -7))}
                disabled={startDate <= new Date()}
                aria-label="Semaine précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="date-range">
                {format(startDate, 'd MMM', { locale: fr })} - {format(addDays(startDate, 6), 'd MMM yyyy', { locale: fr })}
              </span>
              <button
                className="nav-btn"
                onClick={() => setStartDate(addDays(startDate, 7))}
                aria-label="Semaine suivante"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="days-grid">
              {days.map(day => {
                const daySlots = slots[day.date] || [];
                const hasSlots = daySlots.length > 0;
                const isSelected = selectedDate === day.date;

                return (
                  <button
                    key={day.date}
                    className={`day-btn ${isSelected ? 'selected' : ''} ${!hasSlots ? 'disabled' : ''}`}
                    onClick={() => hasSlots && handleDateSelect(day.date)}
                    disabled={!hasSlots}
                    aria-label={`${day.dayName} ${day.dayNumber} ${day.month}${hasSlots ? '' : ' - Aucun créneau disponible'}`}
                  >
                    <span className="day-name">{day.dayName}</span>
                    <span className="day-number">{day.dayNumber}</span>
                    <span className="day-month">{day.month}</span>
                    {hasSlots && <span className="slot-count">{daySlots.length} créneaux</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Créneaux horaires */}
          {selectedDate && slots[selectedDate] && (
            <div className="time-slots">
              <h3>Créneaux disponibles le {format(parseISO(selectedDate), 'd MMMM', { locale: fr })}</h3>
              <div className="slots-grid">
                {slots[selectedDate].map((slot, index) => (
                  <button
                    key={index}
                    className={`slot-btn ${selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.startTime}
                    {selectedSlot?.startTime === slot.startTime && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Motif */}
          {selectedSlot && (
            <div className="reason-input">
              <label htmlFor="reason">Motif de la consultation (optionnel)</label>
              <textarea
                id="reason"
                className="form-textarea"
                placeholder="Décrivez brièvement le motif de votre consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Bouton de réservation */}
          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleBooking}
            disabled={!selectedDate || !selectedSlot || bookingLoading}
          >
            {bookingLoading ? (
              <>
                <span className="loader loader-sm"></span>
                Réservation en cours...
              </>
            ) : selectedDate && selectedSlot ? (
              <>
                <Calendar size={20} />
                Confirmer le rendez-vous
              </>
            ) : (
              'Sélectionnez une date et un créneau'
            )}
          </button>
        </section>

        {/* Avis */}
        {reviews.length > 0 && (
          <section className="reviews-section card" aria-labelledby="reviews-title">
            <h2 id="reviews-title">Avis des patients ({practitioner.totalReviews})</h2>
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-date">
                      {format(parseISO(review.createdAt), 'd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <p className="review-author">{review.patientName}</p>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default PractitionerDetail;
