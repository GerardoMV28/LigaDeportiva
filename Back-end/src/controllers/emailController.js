const nodemailer = require('nodemailer');

// ✅ CORREGIDO: createTransporter → createTransport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar configuración al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando email transporter:', error);
  } else {
    console.log('✅ Email transporter configurado correctamente');
  }
});

exports.sendRegistrationEmail = async (req, res) => {
  try {
    const { player, team, sport } = req.body;

    // ✅ VALIDACIÓN DE DATOS CRÍTICOS
    if (!player || !player.email) {
      return res.status(400).json({
        success: false,
        message: 'Datos del jugador incompletos'
      });
    }

    if (!team || !team.name) {
      return res.status(400).json({
        success: false,
        message: 'Datos del equipo incompletos'
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: player.email,
      subject: `🎉 Confirmación de Registro - ${team.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center; }
            .content { padding: 20px; }
            .folio { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .team-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { background: #343a40; color: white; padding: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 Liga Deportiva</h1>
            <h2>¡Registro Exitoso!</h2>
          </div>
          
          <div class="content">
            <h3>Hola ${player.firstName},</h3>
            <p>Tu registro en la liga deportiva ha sido exitoso. Aquí están los detalles:</p>
            
            <div class="folio">
              <h4>📋 Folio de Registro:</h4>
              <p style="font-size: 18px; font-weight: bold; color: #007bff;">${player.registrationFolio || 'Por asignar'}</p>
            </div>
            
            <div class="team-info">
              <h4>🏆 Información del Equipo:</h4>
              <p><strong>Equipo:</strong> ${team.name}</p>
              <p><strong>Deporte:</strong> ${sport?.name || 'No especificado'}</p>
              <p><strong>ID Interno:</strong> ${player.teamInternalId || 'Por asignar'}</p>
            </div>
            
            <div class="player-info">
              <h4>👤 Tus Datos:</h4>
              <p><strong>Nombre:</strong> ${player.firstName} ${player.lastName}</p>
              <p><strong>Email:</strong> ${player.email}</p>
              <p><strong>Posición:</strong> ${player.positions?.find(p => p.isPrimary)?.position || 'Por asignar'}</p>
            </div>
            
            <p>Guarda este folio para cualquier consulta o aclaración.</p>
            <p>¡Te deseamos mucho éxito en la competencia! 🏅</p>
          </div>
          
          <div class="footer">
            <p>Liga Deportiva &copy; ${new Date().getFullYear()}</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    
    res.json({
      success: true,
      message: 'Correo de registro enviado exitosamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar correo de registro',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};