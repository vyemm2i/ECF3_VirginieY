const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Mettre à jour son profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.put('/profile', authenticate, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().matches(/^[0-9+\s-]+$/),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('postalCode').optional().matches(/^[0-9]{5}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation échouée',
        details: errors.array() 
      });
    }

    const { firstName, lastName, phone, dateOfBirth, gender, address, city, postalCode } = req.body;

    const result = await db.query(`
      UPDATE users
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        postal_code = COALESCE($8, postal_code)
      WHERE id = $9
      RETURNING id, email, first_name, last_name, phone, date_of_birth, gender, address, city, postal_code
    `, [firstName, lastName, phone, dateOfBirth, gender, address, city, postalCode, req.user.id]);

    const user = result.rows[0];

    res.json({
      message: 'Profil mis à jour',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        postalCode: user.postal_code
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Changer son mot de passe
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       400:
 *         description: Mot de passe actuel incorrect
 */
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation échouée',
        details: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Récupérer le mot de passe actuel
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe actuel est incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, req.user.id]
    );

    res.json({
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (admin uniquement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [patient, practitioner, admin]
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
 *         description: Liste des utilisateurs
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    if (role) {
      whereClause = `WHERE role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    const queryText = `
      SELECT id, email, role, first_name, last_name, is_active, is_verified, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);
    const result = await db.query(queryText, params);

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await db.query(countQuery, role ? [role] : []);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: result.rows.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.first_name,
        lastName: u.last_name,
        isActive: u.is_active,
        isVerified: u.is_verified,
        createdAt: u.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
