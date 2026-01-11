const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const practitionerRoutes = require('./routes/practitioners');
const appointmentRoutes = require('./routes/appointments');
const specialtyRoutes = require('./routes/specialties');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediBook API',
      version: '1.0.0',
      description: 'API pour la prise de rendez-vous médicaux en ligne',
      contact: {
        name: 'HealthTech Solutions',
        email: 'contact@healthtech.fr'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practitioners', practitionerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MediBook API',
    version: '1.0.0'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `La route ${req.method} ${req.path} n'existe pas`
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏥 MediBook API Server                                   ║
║                                                            ║
║   ✅ Serveur démarré sur le port ${PORT}                      ║
║   📚 Documentation: http://localhost:${PORT}/api-docs          ║
║   🔗 API: http://localhost:${PORT}/api                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
