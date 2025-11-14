const Team = require('../models/team');
const Player = require('../models/player');
const Sport = require('../models/sport');

// Obtener todos los equipos
exports.getTeams = async (req, res) => {
  try {
    console.log('📋 Obteniendo todos los equipos...');
    const teams = await Team.find()
      .populate('sport')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${teams.length} equipos encontrados`);
    
    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    console.error('❌ Error al obtener equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos',
      error: error.message
    });
  }
};

// Crear nuevo equipo - VERSIÓN MEJORADA CON MÁS LOGS
exports.createTeam = async (req, res) => {
  try {
    console.log('🎯 Iniciando creación de equipo...');
    console.log('📦 Datos recibidos en body:', req.body);
    console.log('🖼️ Archivo recibido:', req.file ? `Sí - ${req.file.filename}` : 'No');
    
    const { name, colors, sport, category, description, coach, location, foundedYear, logo } = req.body;

    // ✅ Validar que el deporte exista
    if (!sport) {
      console.log('❌ Error: Deporte no proporcionado');
      return res.status(400).json({
        success: false,
        message: 'El deporte es requerido'
      });
    }

    console.log('🔍 Buscando deporte con ID:', sport);
    const sportExists = await Sport.findById(sport);
    if (!sportExists) {
      console.log('❌ Error: Deporte no encontrado');
      return res.status(400).json({
        success: false,
        message: 'El deporte seleccionado no existe'
      });
    }

    console.log('✅ Deporte encontrado:', sportExists.name);

    // ✅ Crear el equipo con todos los campos
    const teamData = {
      name,
      colors: Array.isArray(colors) ? colors : [colors],
      sport,
      category: category || '',
      description: description || '',
      coach: coach || '',
      location: location || '',
      foundedYear: foundedYear || '',
      logo: logo || ''
    };

    console.log('📝 Datos del equipo a guardar:', teamData);

    const team = new Team(teamData);
    console.log('💾 Guardando equipo en la base de datos...');
    
    await team.save();

    // ✅ Popular el deporte para la respuesta
    await team.populate('sport');

    console.log('✅ Equipo creado exitosamente:', {
      id: team._id,
      name: team.name,
      logo: team.logo,
      sport: team.sport.name
    });

    res.status(201).json({
      success: true,
      data: team,
      message: `Equipo "${team.name}" creado exitosamente para ${sportExists.name}`
    });
  } catch (error) {
    console.error('❌ Error al crear equipo:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear equipo',
      error: error.message
    });
  }
};

// Obtener equipo por ID con sus jugadores
exports.getTeamById = async (req, res) => {
  try {
    console.log(`🔍 Obteniendo equipo con ID: ${req.params.id}`);
    
    const team = await Team.findById(req.params.id).populate('sport');
    
    if (!team) {
      console.log('❌ Equipo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    console.log(`👥 Buscando jugadores del equipo: ${team.name}`);
    const players = await Player.find({ team: req.params.id }).sort({ teamInternalId: 1 });

    console.log(`✅ Equipo encontrado: ${team.name} con ${players.length} jugadores`);
    
    res.json({
      success: true,
      data: {
        team,
        players
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipo',
      error: error.message
    });
  }
};

// Actualizar equipo - VERSIÓN MEJORADA CON MÁS LOGS
exports.updateTeam = async (req, res) => {
  try {
    console.log('🔄 Iniciando actualización de equipo...');
    console.log(`🔍 ID del equipo a actualizar: ${req.params.id}`);
    console.log('📦 Datos recibidos en body:', req.body);
    console.log('🖼️ Archivo recibido:', req.file ? `Sí - ${req.file.filename}` : 'No');

    // ✅ Si hay un archivo de logo en la request, construir URL completa
    if (req.file) {
      req.body.logo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('✅ Logo procesado - URL:', req.body.logo);
    } else {
      console.log('ℹ️ No se recibió nuevo archivo de logo');
    }

    // ✅ Si se está actualizando el deporte, validar que exista
    if (req.body.sport) {
      console.log('🔍 Validando deporte:', req.body.sport);
      const sportExists = await Sport.findById(req.body.sport);
      if (!sportExists) {
        console.log('❌ Error: Deporte no encontrado');
        return res.status(400).json({
          success: false,
          message: 'El deporte seleccionado no existe'
        });
      }
      console.log('✅ Deporte validado:', sportExists.name);
    }

    console.log('💾 Actualizando equipo en la base de datos...');
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sport');

    if (!team) {
      console.log('❌ Equipo no encontrado para actualizar');
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    console.log('✅ Equipo actualizado exitosamente:', {
      id: team._id,
      name: team.name,
      logo: team.logo,
      sport: team.sport.name
    });

    res.json({
      success: true,
      data: team,
      message: 'Equipo actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar equipo:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar equipo',
      error: error.message
    });
  }
};

// Obtener equipos por deporte
exports.getTeamsBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    console.log(`🔍 Obteniendo equipos para deporte ID: ${sportId}`);
    
    const sportExists = await Sport.findById(sportId);
    if (!sportExists) {
      console.log('❌ Deporte no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }

    console.log(`📋 Buscando equipos de: ${sportExists.name}`);
    const teams = await Team.find({ sport: sportId })
      .populate('sport')
      .sort({ name: 1 });

    console.log(`✅ ${teams.length} equipos encontrados para ${sportExists.name}`);

    res.json({
      success: true,
      data: teams,
      count: teams.length,
      sport: sportExists.name
    });
  } catch (error) {
    console.error('❌ Error al obtener equipos por deporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por deporte',
      error: error.message
    });
  }
};

// Eliminar equipo
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    console.log(`🗑️ Intentando eliminar equipo ID: ${teamId}`);

    const team = await Team.findById(teamId);
    if (!team) {
      console.log('❌ Equipo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    console.log(`🔍 Verificando jugadores del equipo: ${team.name}`);
    const playersCount = await Player.countDocuments({ team: teamId });
    
    if (playersCount > 0) {
      console.log(`❌ No se puede eliminar - Tiene ${playersCount} jugadores`);
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el equipo. Tiene ${playersCount} jugador(es) asociado(s).`,
        playersCount: playersCount,
        hasPlayers: true
      });
    }

    console.log('✅ Eliminando equipo...');
    await Team.findByIdAndDelete(teamId);

    console.log(`✅ Equipo "${team.name}" eliminado exitosamente`);

    res.json({
      success: true,
      message: `Equipo "${team.name}" eliminado exitosamente`,
      data: team
    });
  } catch (error) {
    console.error('❌ Error al eliminar equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar equipo',
      error: error.message
    });
  }
};

// Eliminar equipo con todos sus jugadores
exports.deleteTeamWithPlayers = async (req, res) => {
  try {
    const teamId = req.params.id;
    console.log(`💥 Intentando eliminar equipo con jugadores ID: ${teamId}`);

    const team = await Team.findById(teamId);
    if (!team) {
      console.log('❌ Equipo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    console.log(`🔍 Contando jugadores del equipo: ${team.name}`);
    const playersCount = await Player.countDocuments({ team: teamId });
    
    console.log(`🗑️ Eliminando ${playersCount} jugadores...`);
    const deleteResult = await Player.deleteMany({ team: teamId });

    console.log('🗑️ Eliminando equipo...');
    await Team.findByIdAndDelete(teamId);

    console.log(`✅ Equipo "${team.name}" y sus ${playersCount} jugadores eliminados exitosamente`);

    res.json({
      success: true,
      message: `Equipo "${team.name}" y sus ${playersCount} jugador(es) eliminados exitosamente`,
      data: {
        team,
        playersDeleted: playersCount,
        deleteResult
      }
    });
  } catch (error) {
    console.error('❌ Error al eliminar equipo con jugadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar equipo con jugadores',
      error: error.message
    });
  }
};