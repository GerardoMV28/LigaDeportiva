// controllers/sport-controller.js
const Sport = require('../models/sport');

exports.getSports = async (req, res) => {
  try {
    console.log('✅ GET /api/sports - Solicitando deportes');
    const sports = await Sport.find();
    console.log(`📊 Deportes encontrados: ${sports.length}`);
    
    res.json({
      success: true,
      data: sports,
      count: sports.length
    });
  } catch (error) {
    console.error('❌ Error al obtener deportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener deportes',
      error: error.message
    });
  }
};

exports.getSportById = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }
    res.json({ success: true, data: sport });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener deporte',
      error: error.message
    });
  }
};

exports.getSportPositions = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }
    res.json({ success: true, data: sport.positions || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posiciones',
      error: error.message
    });
  }
};

exports.createSport = async (req, res) => {
  try {
    console.log('📥 POST /api/sports - Datos recibidos:', req.body);
    
    const { name, description, positions } = req.body;
    
    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre del deporte es requerido'
      });
    }
    
    // Verificar si el deporte ya existe
    const existingSport = await Sport.findOne({ name: name.trim() });
    if (existingSport) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un deporte con ese nombre'
      });
    }
    
    const sport = new Sport({
      name: name.trim(),
      description: description?.trim() || '',
      positions: positions || []
    });
    
    await sport.save();
    console.log('✅ Deporte creado exitosamente:', sport);
    
    res.status(201).json({
      success: true,
      message: 'Deporte creado exitosamente',
      data: sport
    });
  } catch (error) {
    console.error('❌ Error al crear deporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear deporte',
      error: error.message
    });
  }
};

exports.updateSport = async (req, res) => {
  try {
    console.log('📝 PUT /api/sports/' + req.params.id, 'Datos:', req.body);
    
    const { name, description, positions } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre del deporte es requerido'
      });
    }
    
    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description?.trim() || '',
        positions: positions || []
      },
      { new: true, runValidators: true }
    );
    
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }
    
    console.log('✅ Deporte actualizado:', sport);
    
    res.json({
      success: true,
      message: 'Deporte actualizado exitosamente',
      data: sport
    });
  } catch (error) {
    console.error('❌ Error al actualizar deporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar deporte',
      error: error.message
    });
  }
};

exports.deleteSport = async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/sports/' + req.params.id);
    
    const sport = await Sport.findByIdAndDelete(req.params.id);
    
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }
    
    console.log('✅ Deporte eliminado:', sport.name);
    
    res.json({
      success: true,
      message: 'Deporte eliminado exitosamente',
      data: sport
    });
  } catch (error) {
    console.error('❌ Error al eliminar deporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar deporte',
      error: error.message
    });
  }
};