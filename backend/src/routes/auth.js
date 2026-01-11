const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../utils/database');
const { generateToken, authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification et inscription
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [patient, practitioner]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides ou email déjà utilisé
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[!@#$%^&*]/).withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
  body('firstName').trim().notEmpty().withMessage('Prénom requis'),
  body('lastName').trim().notEmpty().withMessage('Nom requis'),
  body('role').optional().isIn(['patient', 'practitioner']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation échouée',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, role = 'patient' } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un compte existe déjà avec cet email'
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const result = await db.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, true, false)
      RETURNING id, email, role, first_name, last_name
    `, [email, passwordHash, role, firstName, lastName, phone]);

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation échouée',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await db.query(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = result.rows[0];

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified
      },
      token
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, role, first_name, last_name, phone, date_of_birth, gender, address, city, postal_code, is_verified, created_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        postalCode: user.postal_code,
        isVerified: user.is_verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
