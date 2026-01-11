const jwt = require('jsonwebtoken');
const db = require('../utils/database');

const JWT_SECRET = process.env.JWT_SECRET || 'medibook-secret-key';

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Non autorisé',
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Vérifier que l'utilisateur existe toujours
      const result = await db.query(
        'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Non autorisé',
          message: 'Utilisateur non trouvé'
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          error: 'Compte désactivé',
          message: 'Votre compte a été désactivé'
        });
      }

      // Ajouter l'utilisateur à la requête
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expirée',
          message: 'Votre session a expiré, veuillez vous reconnecter'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Token invalide'
    });
  }
};

// Middleware de vérification des rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non autorisé',
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires'
      });
    }

    next();
  };
};

// Middleware optionnel (utilisateur authentifié ou non)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await db.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name
      };
    }
  } catch (error) {
    // Ignorer les erreurs - l'utilisateur continue sans être authentifié
  }

  next();
};

// Générer un token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  generateToken,
  JWT_SECRET
};
