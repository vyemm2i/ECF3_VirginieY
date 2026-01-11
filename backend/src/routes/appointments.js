const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gestion des rendez-vous
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Récupérer ses rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, no_show]
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let paramIndex = 1;

    let whereConditions = [];

    // Filtrer selon le rôle
    if (req.user.role === 'patient') {
      whereConditions.push(`a.patient_id = $${paramIndex}`);
      params.push(req.user.id);
      paramIndex++;
    } else if (req.user.role === 'practitioner') {
      // Récupérer l'ID du praticien
      const practResult = await db.query(
        'SELECT id FROM practitioners WHERE user_id = $1',
        [req.user.id]
      );
      if (practResult.rows.length === 0) {
        return res.status(404).json({ error: 'Profil praticien non trouvé' });
      }
      whereConditions.push(`a.practitioner_id = $${paramIndex}`);
      params.push(practResult.rows[0].id);
      paramIndex++;
    }

    // Filtre par statut
    if (status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filtrer les rendez-vous à venir
    if (upcoming === 'true') {
      whereConditions.push(`(a.appointment_date > CURRENT_DATE OR (a.appointment_date = CURRENT_DATE AND a.start_time > CURRENT_TIME))`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    const queryText = `
      SELECT 
        a.id,
        a.appointment_date,
        a.start_time,
        a.end_time,
        a.status,
        a.type,
        a.reason,
        a.notes,
        a.created_at,
        p.id as practitioner_id,
        pu.first_name as practitioner_first_name,
        pu.last_name as practitioner_last_name,
        s.name as specialty_name,
        p.office_address,
        p.office_city,
        p.consultation_price,
        pat.first_name as patient_first_name,
        pat.last_name as patient_last_name,
        pat.email as patient_email,
        pat.phone as patient_phone
      FROM appointments a
      JOIN practitioners p ON a.practitioner_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN specialties s ON p.specialty_id = s.id
      JOIN users pat ON a.patient_id = pat.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);
    const result = await db.query(queryText, params);

    // Compter le total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM appointments a
      JOIN practitioners p ON a.practitioner_id = p.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      appointments: result.rows.map(a => ({
        id: a.id,
        date: a.appointment_date,
        startTime: a.start_time,
        endTime: a.end_time,
        status: a.status,
        type: a.type,
        reason: a.reason,
        notes: a.notes,
        createdAt: a.created_at,
        practitioner: {
          id: a.practitioner_id,
          firstName: a.practitioner_first_name,
          lastName: a.practitioner_last_name,
          fullName: `Dr. ${a.practitioner_first_name} ${a.practitioner_last_name}`,
          specialty: a.specialty_name,
          address: `${a.office_address}, ${a.office_city}`,
          price: parseFloat(a.consultation_price)
        },
        patient: req.user.role === 'practitioner' ? {
          firstName: a.patient_first_name,
          lastName: a.patient_last_name,
          email: a.patient_email,
          phone: a.patient_phone
        } : undefined
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practitionerId
 *               - date
 *               - startTime
 *             properties:
 *               practitionerId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [in_person, teleconsultation]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rendez-vous créé
 *       400:
 *         description: Créneau non disponible
 */
router.post('/', authenticate, authorize('patient'), [
  body('practitionerId').notEmpty().withMessage('Praticien requis'),
  body('date').isDate().withMessage('Date invalide'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Heure invalide'),
  body('type').optional().isIn(['in_person', 'teleconsultation'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation échouée',
        details: errors.array() 
      });
    }

    const { practitionerId, date, startTime, type = 'in_person', reason } = req.body;

    // Vérifier que le praticien existe
    const practResult = await db.query(`
      SELECT p.id, p.consultation_duration, p.consultation_price, p.teleconsultation_available,
             u.first_name, u.last_name, u.email as practitioner_email
      FROM practitioners p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [practitionerId]);

    if (practResult.rows.length === 0) {
      return res.status(404).json({ error: 'Praticien non trouvé' });
    }

    const practitioner = practResult.rows[0];

    // Vérifier la téléconsultation si demandée
    if (type === 'teleconsultation' && !practitioner.teleconsultation_available) {
      return res.status(400).json({ 
        error: 'Téléconsultation non disponible',
        message: 'Ce praticien ne propose pas la téléconsultation'
      });
    }

    // Calculer l'heure de fin
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + practitioner.consultation_duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    // Vérifier que le créneau n'est pas déjà pris
    const conflictResult = await db.query(`
      SELECT id FROM appointments
      WHERE practitioner_id = $1 
        AND appointment_date = $2
        AND status NOT IN ('cancelled')
        AND (
          (start_time <= $3 AND end_time > $3)
          OR (start_time < $4 AND end_time >= $4)
          OR (start_time >= $3 AND end_time <= $4)
        )
    `, [practitionerId, date, startTime, endTime]);

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Créneau non disponible',
        message: 'Ce créneau a déjà été réservé'
      });
    }

    // Vérifier que la date n'est pas dans le passé
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      return res.status(400).json({
        error: 'Date invalide',
        message: 'Vous ne pouvez pas réserver dans le passé'
      });
    }

    // Créer le rendez-vous
    const result = await db.query(`
      INSERT INTO appointments (patient_id, practitioner_id, appointment_date, start_time, end_time, status, type, reason)
      VALUES ($1, $2, $3, $4, $5, 'confirmed', $6, $7)
      RETURNING id, appointment_date, start_time, end_time, status, type
    `, [req.user.id, practitionerId, date, startTime, endTime, type, reason]);

    const appointment = result.rows[0];

    // Récupérer les infos du patient
    const patientResult = await db.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    const patient = patientResult.rows[0];

    // Formater la date pour l'email
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Envoyer l'email de confirmation au patient
    await sendEmail(
      patient.email,
      'appointmentConfirmation',
      [
        patient.first_name,
        `Dr. ${practitioner.first_name} ${practitioner.last_name}`,
        formattedDate,
        startTime,
        type
      ],
      req.user.id
    );

    // Créer une notification
    await db.query(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, 'appointment_confirmed', 'Rendez-vous confirmé', $2, $3)
    `, [
      req.user.id,
      `Votre rendez-vous avec Dr. ${practitioner.first_name} ${practitioner.last_name} le ${formattedDate} à ${startTime} a été confirmé.`,
      JSON.stringify({ appointmentId: appointment.id })
    ]);

    res.status(201).json({
      message: 'Rendez-vous créé avec succès',
      appointment: {
        id: appointment.id,
        date: appointment.appointment_date,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        type: appointment.type,
        practitioner: {
          id: practitionerId,
          name: `Dr. ${practitioner.first_name} ${practitioner.last_name}`,
          price: parseFloat(practitioner.consultation_price)
        }
      }
    });
  } catch (error) {
    console.error('Erreur création RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Obtenir les détails d'un rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du rendez-vous
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        a.*,
        p.id as practitioner_id,
        pu.first_name as practitioner_first_name,
        pu.last_name as practitioner_last_name,
        pu.email as practitioner_email,
        pu.phone as practitioner_phone,
        s.name as specialty_name,
        p.office_address,
        p.office_city,
        p.office_postal_code,
        p.consultation_price,
        p.teleconsultation_available,
        pat.id as patient_id,
        pat.first_name as patient_first_name,
        pat.last_name as patient_last_name,
        pat.email as patient_email,
        pat.phone as patient_phone
      FROM appointments a
      JOIN practitioners p ON a.practitioner_id = p.id
      JOIN users pu ON p.user_id = pu.id
      JOIN specialties s ON p.specialty_id = s.id
      JOIN users pat ON a.patient_id = pat.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const a = result.rows[0];

    // Vérifier que l'utilisateur a accès à ce RDV
    const isPatient = a.patient_id === req.user.id;
    const isPractitioner = req.user.role === 'practitioner';
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isPractitioner && !isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({
      appointment: {
        id: a.id,
        date: a.appointment_date,
        startTime: a.start_time,
        endTime: a.end_time,
        status: a.status,
        type: a.type,
        reason: a.reason,
        notes: a.notes,
        createdAt: a.created_at,
        practitioner: {
          id: a.practitioner_id,
          firstName: a.practitioner_first_name,
          lastName: a.practitioner_last_name,
          fullName: `Dr. ${a.practitioner_first_name} ${a.practitioner_last_name}`,
          email: a.practitioner_email,
          phone: a.practitioner_phone,
          specialty: a.specialty_name,
          address: {
            street: a.office_address,
            city: a.office_city,
            postalCode: a.office_postal_code
          },
          price: parseFloat(a.consultation_price),
          teleconsultationAvailable: a.teleconsultation_available
        },
        patient: {
          id: a.patient_id,
          firstName: a.patient_first_name,
          lastName: a.patient_last_name,
          email: a.patient_email,
          phone: a.patient_phone
        }
      }
    });
  } catch (error) {
    console.error('Erreur détails RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   put:
 *     summary: Annuler un rendez-vous
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendez-vous annulé
 */
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Récupérer le RDV
    const result = await db.query(`
      SELECT a.*, p.user_id as practitioner_user_id
      FROM appointments a
      JOIN practitioners p ON a.practitioner_id = p.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const appointment = result.rows[0];

    // Vérifier les droits
    const isPatient = appointment.patient_id === req.user.id;
    const isPractitioner = appointment.practitioner_user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isPractitioner && !isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifier le statut
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Ce rendez-vous est déjà annulé' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Impossible d\'annuler un rendez-vous terminé' });
    }

    // Annuler le RDV
    await db.query(`
      UPDATE appointments 
      SET status = 'cancelled', 
          cancellation_reason = $1,
          cancelled_by = $2,
          cancelled_at = NOW()
      WHERE id = $3
    `, [reason, req.user.id, id]);

    res.json({
      message: 'Rendez-vous annulé avec succès'
    });
  } catch (error) {
    console.error('Erreur annulation RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/appointments/{id}/complete:
 *   put:
 *     summary: Marquer un rendez-vous comme terminé (praticien uniquement)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendez-vous marqué comme terminé
 */
router.put('/:id/complete', authenticate, authorize('practitioner', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await db.query(`
      UPDATE appointments 
      SET status = 'completed', notes = COALESCE($1, notes)
      WHERE id = $2 AND status = 'confirmed'
      RETURNING id
    `, [notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Rendez-vous non trouvé ou non modifiable' 
      });
    }

    res.json({
      message: 'Rendez-vous marqué comme terminé'
    });
  } catch (error) {
    console.error('Erreur completion RDV:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
