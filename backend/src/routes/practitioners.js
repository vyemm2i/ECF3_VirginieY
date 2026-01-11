const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const db = require('../utils/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Practitioners
 *   description: Gestion des praticiens
 */

/**
 * @swagger
 * /api/practitioners:
 *   get:
 *     summary: Rechercher des praticiens
 *     tags: [Practitioners]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: ID ou nom de la spécialité
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Ville
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nom du praticien
 *       - in: query
 *         name: teleconsultation
 *         schema:
 *           type: boolean
 *         description: Filtrer par téléconsultation disponible
 *       - in: query
 *         name: acceptsNew
 *         schema:
 *           type: boolean
 *         description: Accepte les nouveaux patients
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des praticiens
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      specialty, 
      city, 
      name, 
      teleconsultation, 
      acceptsNew,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereConditions = ['u.is_active = true'];
    let paramIndex = 1;

    // Filtre par spécialité
    if (specialty) {
      whereConditions.push(`(s.id::text = $${paramIndex} OR LOWER(s.name) LIKE LOWER($${paramIndex + 1}))`);
      params.push(specialty, `%${specialty}%`);
      paramIndex += 2;
    }

    // Filtre par ville
    if (city) {
      whereConditions.push(`LOWER(p.office_city) LIKE LOWER($${paramIndex})`);
      params.push(`%${city}%`);
      paramIndex++;
    }

    // Filtre par nom
    if (name) {
      whereConditions.push(`(LOWER(u.first_name) LIKE LOWER($${paramIndex}) OR LOWER(u.last_name) LIKE LOWER($${paramIndex}))`);
      params.push(`%${name}%`);
      paramIndex++;
    }

    // Filtre téléconsultation
    if (teleconsultation === 'true') {
      whereConditions.push('p.teleconsultation_available = true');
    }

    // Filtre nouveaux patients
    if (acceptsNew === 'true') {
      whereConditions.push('p.accepts_new_patients = true');
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    // Requête principale
    const queryText = `
      SELECT 
        p.id,
        p.user_id,
        u.first_name,
        u.last_name,
        u.email,
        s.id as specialty_id,
        s.name as specialty_name,
        s.icon as specialty_icon,
        p.bio,
        p.consultation_duration,
        p.consultation_price,
        p.accepts_new_patients,
        p.teleconsultation_available,
        p.office_address,
        p.office_city,
        p.office_postal_code,
        p.average_rating,
        p.total_reviews
      FROM practitioners p
      JOIN users u ON p.user_id = u.id
      JOIN specialties s ON p.specialty_id = s.id
      ${whereClause}
      ORDER BY p.average_rating DESC, p.total_reviews DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(queryText, params);

    // Compter le total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM practitioners p
      JOIN users u ON p.user_id = u.id
      JOIN specialties s ON p.specialty_id = s.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      practitioners: result.rows.map(p => ({
        id: p.id,
        userId: p.user_id,
        firstName: p.first_name,
        lastName: p.last_name,
        fullName: `Dr. ${p.first_name} ${p.last_name}`,
        email: p.email,
        specialty: {
          id: p.specialty_id,
          name: p.specialty_name,
          icon: p.specialty_icon
        },
        bio: p.bio,
        consultationDuration: p.consultation_duration,
        consultationPrice: parseFloat(p.consultation_price),
        acceptsNewPatients: p.accepts_new_patients,
        teleconsultationAvailable: p.teleconsultation_available,
        address: {
          street: p.office_address,
          city: p.office_city,
          postalCode: p.office_postal_code
        },
        rating: parseFloat(p.average_rating),
        totalReviews: p.total_reviews
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur recherche praticiens:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/practitioners/{id}:
 *   get:
 *     summary: Obtenir les détails d'un praticien
 *     tags: [Practitioners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du praticien
 *       404:
 *         description: Praticien non trouvé
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        p.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.id as specialty_id,
        s.name as specialty_name,
        s.description as specialty_description,
        s.icon as specialty_icon
      FROM practitioners p
      JOIN users u ON p.user_id = u.id
      JOIN specialties s ON p.specialty_id = s.id
      WHERE p.id = $1 AND u.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Non trouvé',
        message: 'Praticien non trouvé'
      });
    }

    const p = result.rows[0];

    // Récupérer les disponibilités
    const availabilityResult = await db.query(`
      SELECT day_of_week, start_time, end_time
      FROM availability_slots
      WHERE practitioner_id = $1 AND is_active = true
      ORDER BY day_of_week, start_time
    `, [id]);

    // Récupérer les derniers avis
    const reviewsResult = await db.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.is_anonymous,
        r.created_at,
        CASE WHEN r.is_anonymous THEN 'Patient anonyme' ELSE u.first_name END as patient_name
      FROM reviews r
      JOIN users u ON r.patient_id = u.id
      WHERE r.practitioner_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [id]);

    res.json({
      practitioner: {
        id: p.id,
        userId: p.user_id,
        firstName: p.first_name,
        lastName: p.last_name,
        fullName: `Dr. ${p.first_name} ${p.last_name}`,
        email: p.email,
        phone: p.phone,
        specialty: {
          id: p.specialty_id,
          name: p.specialty_name,
          description: p.specialty_description,
          icon: p.specialty_icon
        },
        licenseNumber: p.license_number,
        bio: p.bio,
        consultationDuration: p.consultation_duration,
        consultationPrice: parseFloat(p.consultation_price),
        acceptsNewPatients: p.accepts_new_patients,
        teleconsultationAvailable: p.teleconsultation_available,
        address: {
          street: p.office_address,
          city: p.office_city,
          postalCode: p.office_postal_code,
          coordinates: p.latitude && p.longitude ? {
            lat: parseFloat(p.latitude),
            lng: parseFloat(p.longitude)
          } : null
        },
        rating: parseFloat(p.average_rating),
        totalReviews: p.total_reviews
      },
      availability: availabilityResult.rows.map(a => ({
        dayOfWeek: a.day_of_week,
        startTime: a.start_time,
        endTime: a.end_time
      })),
      reviews: reviewsResult.rows.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        patientName: r.patient_name,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Erreur détails praticien:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/practitioners/{id}/slots:
 *   get:
 *     summary: Obtenir les créneaux disponibles d'un praticien
 *     tags: [Practitioners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date pour laquelle chercher les créneaux
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Créneaux disponibles
 */
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    let { date, startDate, endDate } = req.query;

    // Par défaut, afficher les 7 prochains jours
    if (!date && !startDate) {
      startDate = new Date().toISOString().split('T')[0];
    }
    if (!endDate) {
      const end = new Date(startDate || date);
      end.setDate(end.getDate() + 7);
      endDate = end.toISOString().split('T')[0];
    }

    // Récupérer les infos du praticien
    const practResult = await db.query(
      'SELECT consultation_duration FROM practitioners WHERE id = $1',
      [id]
    );

    if (practResult.rows.length === 0) {
      return res.status(404).json({ error: 'Praticien non trouvé' });
    }

    const duration = practResult.rows[0].consultation_duration;

    // Récupérer les disponibilités récurrentes
    const availResult = await db.query(`
      SELECT day_of_week, start_time, end_time
      FROM availability_slots
      WHERE practitioner_id = $1 AND is_active = true
    `, [id]);

    // Récupérer les rendez-vous existants
    const appointmentsResult = await db.query(`
      SELECT appointment_date, start_time, end_time
      FROM appointments
      WHERE practitioner_id = $1 
        AND appointment_date BETWEEN $2 AND $3
        AND status NOT IN ('cancelled')
    `, [id, startDate || date, endDate || date]);

    const bookedSlots = appointmentsResult.rows.map(a => ({
      date: a.appointment_date.toISOString().split('T')[0],
      startTime: a.start_time,
      endTime: a.end_time
    }));

    // Générer les créneaux disponibles
    const slots = [];
    const start = new Date(startDate || date);
    const end = new Date(endDate || date);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split('T')[0];

      // Ne pas afficher les créneaux passés pour aujourd'hui
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5);

      // Trouver les disponibilités pour ce jour
      const dayAvailability = availResult.rows.filter(a => a.day_of_week === dayOfWeek);

      for (const avail of dayAvailability) {
        let slotStart = avail.start_time.slice(0, 5);
        const slotEnd = avail.end_time.slice(0, 5);

        while (slotStart < slotEnd) {
          // Calculer l'heure de fin du créneau
          const [hours, minutes] = slotStart.split(':').map(Number);
          const endMinutes = hours * 60 + minutes + duration;
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const slotEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

          if (slotEndTime > slotEnd) break;

          // Vérifier si le créneau n'est pas déjà pris
          const isBooked = bookedSlots.some(b => 
            b.date === dateStr && b.startTime.slice(0, 5) === slotStart
          );

          // Vérifier si le créneau n'est pas dans le passé
          const isPast = isToday && slotStart <= currentTime;

          if (!isBooked && !isPast) {
            slots.push({
              date: dateStr,
              startTime: slotStart,
              endTime: slotEndTime,
              available: true
            });
          }

          // Passer au créneau suivant
          slotStart = slotEndTime;
        }
      }
    }

    // Grouper par date
    const slotsByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push({
        startTime: slot.startTime,
        endTime: slot.endTime
      });
      return acc;
    }, {});

    res.json({
      practitionerId: id,
      consultationDuration: duration,
      slots: slotsByDate
    });
  } catch (error) {
    console.error('Erreur créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
