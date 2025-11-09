const User = require('../models/User');

const temporaryUsers = [
  {
    _id: 1,
    name: 'Administrador Liga',
    email: 'admin@ligadeportiva.com',
    role: 'admin'
  },
  {
    _id: 2, 
    name: 'Carlos Martínez',
    email: 'carlos@ligadeportiva.com',
    role: 'coach'
  },
  {
    _id: 3,
    name: 'Ana Rodríguez',
    email: 'ana@ligadeportiva.com', 
    role: 'player'
  }
];

exports.getUsers = async (req, res) => {
  try {
    // Intentar con la base de datos real
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users,
      count: users.length,
      source: 'database'
    });
  } catch (error) {
    // Si hay error, usar datos temporales
    console.log('⚠️  Usando datos temporales - MongoDB no disponible');
    res.json({
      success: true,
      data: temporaryUsers,
      count: temporaryUsers.length,
      source: 'temporary'
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};