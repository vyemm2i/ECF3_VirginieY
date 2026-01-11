const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
  process.exit(-1);
});

// Fonction utilitaire pour les requêtes
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query:', { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('❌ Erreur SQL:', error.message);
    throw error;
  }
};

// Fonction pour les transactions
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Timeout après 5 secondes d'inactivité
  const timeout = setTimeout(() => {
    console.error('⚠️ Client inactif depuis trop longtemps');
    console.error('Last query:', client.lastQuery);
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool
};
