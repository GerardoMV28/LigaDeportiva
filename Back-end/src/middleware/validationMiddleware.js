const validateTeam = (req, res, next) => {
  const { name, colors } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre del equipo es requerido'
    });
  }

  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Los colores del equipo son requeridos'
    });
  }

  next();
};

const validatePlayer = (req, res, next) => {
  const requiredFields = [
    'firstName', 'lastName', 'sex', 'birthDate', 
    'weight', 'height', 'position', 'birthCity', 
    'yearsInSport', 'email', 'team'
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
    });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      success: false,
      message: 'El formato del email no es válido'
    });
  }

  next();
};

module.exports = { validateTeam, validatePlayer };