const nodemailer = require('nodemailer');
const db = require('../utils/database');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: parseInt(process.env.SMTP_PORT) || 1025,
  secure: false,
  // Pour Mailhog, pas besoin d'authentification
});

// Templates d'emails
const emailTemplates = {
  verification: (firstName, token) => ({
    subject: 'MediBook - Confirmez votre adresse email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MediBook</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Merci de vous être inscrit sur MediBook !</p>
            <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" class="button">
                Confirmer mon email
              </a>
            </p>
            <p>Ce lien expire dans 24 heures.</p>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© 2024 MediBook - HealthTech Solutions</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  appointmentConfirmation: (patientName, practitionerName, date, time, type) => ({
    subject: 'MediBook - Confirmation de votre rendez-vous',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-box { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .button-danger { background: #dc3545; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Rendez-vous confirmé</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${patientName},</h2>
            <p>Votre rendez-vous a été confirmé avec succès.</p>
            <div class="appointment-box">
              <div class="info-row">
                <strong>Praticien :</strong>
                <span>${practitionerName}</span>
              </div>
              <div class="info-row">
                <strong>Date :</strong>
                <span>${date}</span>
              </div>
              <div class="info-row">
                <strong>Heure :</strong>
                <span>${time}</span>
              </div>
              <div class="info-row">
                <strong>Type :</strong>
                <span>${type === 'teleconsultation' ? '📹 Téléconsultation' : '🏥 En cabinet'}</span>
              </div>
            </div>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/appointments" class="button">
                Voir mes rendez-vous
              </a>
              <a href="${process.env.FRONTEND_URL}/appointments/cancel" class="button button-danger">
                Annuler
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 MediBook - HealthTech Solutions</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  appointmentReminder: (patientName, practitionerName, date, time) => ({
    subject: 'MediBook - Rappel de votre rendez-vous demain',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Rappel de rendez-vous</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${patientName},</h2>
            <p>N'oubliez pas votre rendez-vous <strong>demain</strong> :</p>
            <ul>
              <li><strong>Praticien :</strong> ${practitionerName}</li>
              <li><strong>Date :</strong> ${date}</li>
              <li><strong>Heure :</strong> ${time}</li>
            </ul>
            <p>À demain !</p>
          </div>
          <div class="footer">
            <p>© 2024 MediBook - HealthTech Solutions</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (firstName, token) => ({
    subject: 'MediBook - Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Réinitialisation du mot de passe</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" class="button">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
          <div class="footer">
            <p>© 2024 MediBook - HealthTech Solutions</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Fonction d'envoi d'email
const sendEmail = async (to, templateName, templateParams, userId = null) => {
  try {
    const template = emailTemplates[templateName](...templateParams);
    
    const mailOptions = {
      from: '"MediBook" <noreply@medibook.fr>',
      to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Logger l'email dans la base de données
    if (userId) {
      await db.query(
        `INSERT INTO email_logs (user_id, email_to, email_type, subject, status) 
         VALUES ($1, $2, $3, $4, 'sent')`,
        [userId, to, templateName, template.subject]
      );
    }

    console.log('📧 Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    
    // Logger l'erreur
    if (userId) {
      await db.query(
        `INSERT INTO email_logs (user_id, email_to, email_type, subject, status, error_message) 
         VALUES ($1, $2, $3, $4, 'failed', $5)`,
        [userId, to, templateName, 'Email failed', error.message]
      );
    }
    
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  transporter
};
