import api from './api';

export const trainerService = {
  async getTrainerProfile() {
    try {
      const response = await api.get('/trainer');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil dresseur:', error);
      throw error;
    }
  },

  async updateTrainerProfile(trainerData) {
    try {
      const response = await api.put('/trainer', trainerData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil dresseur:', error);
      throw error;
    }
  },

  async markPokemon(pokemonId, isCaptured) {
    try {
      const response = await api.post('/trainer/mark', { pokemonId, isCaptured });
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors du marquage du Pokémon:', error);
      throw error;
    }
  }
};
