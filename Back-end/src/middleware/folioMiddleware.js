const Team = require('../models/team');
const Player = require('../models/player');

const generateFolio = async (teamId, playerFirstName, teamInternalId) => {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Equipo no encontrado');
    }

    // Formatear el nombre del equipo (sin espacios, máximo 10 caracteres)
    const teamNameFormatted = team.name
      .replace(/\s+/g, '')
      .substring(0, 10)
      .toUpperCase();

    // Formatear el nombre del jugador (sin espacios, máximo 8 caracteres)
    const playerNameFormatted = playerFirstName
      .replace(/\s+/g, '')
      .substring(0, 8)
      .toUpperCase();

    // Crear el folio: Equipo-001-Jugador-001
    const folio = `${teamNameFormatted}-${teamInternalId.toString().padStart(3, '0')}-${playerNameFormatted}-${teamInternalId.toString().padStart(3, '0')}`;
    
    return folio;
  } catch (error) {
    throw error;
  }
};

module.exports = { generateFolio };