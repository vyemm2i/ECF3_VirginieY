const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer ses notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { unreadOnly, limit = 20 } = req.query;

    let whereClause = 'WHERE user_id = $1';
    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = false';
    }

    const result = await db.query(`
      SELECT id, type, title, message, is_read, data, created_at
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $2
    `, [req.user.id, parseInt(limit)]);

    // Compter les non lues
    const unreadResult = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );

    res.json({
      notifications: result.rows.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        data: n.data,
        createdAt: n.created_at
      })),
      unreadCount: parseInt(unreadResult.rows[0].count)
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
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
 *         description: Notification marquée comme lue
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur mise à jour notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
