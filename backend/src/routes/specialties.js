const express = require('express');
const router = express.Router();
const db = require('../utils/database');

/**
 * @swagger
 * tags:
 *   name: Specialties
 *   description: Gestion des spécialités médicales
 */

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Récupérer toutes les spécialités
 *     tags: [Specialties]
 *     responses:
 *       200:
 *         description: Liste des spécialités
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.icon,
        COUNT(p.id) as practitioner_count
      FROM specialties s
      LEFT JOIN practitioners p ON s.id = p.specialty_id
      LEFT JOIN users u ON p.user_id = u.id AND u.is_active = true
      GROUP BY s.id
      ORDER BY s.name
    `);

    res.json({
      specialties: result.rows.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        practitionerCount: parseInt(s.practitioner_count)
      }))
    });
  } catch (error) {
    console.error('Erreur récupération spécialités:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/specialties/{id}:
 *   get:
 *     summary: Obtenir une spécialité par ID
 *     tags: [Specialties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la spécialité
 *       404:
 *         description: Spécialité non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.icon,
        COUNT(p.id) as practitioner_count
      FROM specialties s
      LEFT JOIN practitioners p ON s.id = p.specialty_id
      LEFT JOIN users u ON p.user_id = u.id AND u.is_active = true
      WHERE s.id = $1
      GROUP BY s.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spécialité non trouvée' });
    }

    const s = result.rows[0];

    res.json({
      specialty: {
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        practitionerCount: parseInt(s.practitioner_count)
      }
    });
  } catch (error) {
    console.error('Erreur récupération spécialité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
