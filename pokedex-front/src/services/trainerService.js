import api from './api';

export const trainerService = {
  async getTrainerProfile() {
    try {
      const response = await api.get('/trainer');
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Le dresseur n'existe pas encore, on le crée automatiquement
        console.log("Création automatique du profil dresseur...");
        const newTrainerResponse = await api.post('/trainer', {
            trainerName: 'Nouveau Dresseur',
            imgUrl: ''
        });
        return newTrainerResponse.data.data;
      }
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
