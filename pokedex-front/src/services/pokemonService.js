import api from './api';

function formatLocalData(pokemon) {
  let numericId = 1;
  if (pokemon.regions && pokemon.regions.length > 0) {
      numericId = pokemon.regions[0].regionPokedexNumber;
  } else {
      let hash = 0;
      for (let i = 0; i < pokemon.name.length; i++) {
        hash = pokemon.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      numericId = Math.abs(hash % 151) + 1;
  }

  return {
    ...pokemon,
    id: numericId, 
    displayId: `#${String(numericId).padStart(3, '0')}`,
    numericId,
    shinyImgUrl: pokemon.shinyImgUrl || null,
    weaknesses: pokemon.weaknesses || ['normal'],
    abilities: pokemon.abilities || ['Unknown'],
    height: pokemon.height || '??m',
    weight: pokemon.weight || '??kg',
    category: pokemon.category || 'Unknown',
    gender: pokemon.gender || { male: false, female: false },
    stats: pokemon.stats || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
    evolutions: pokemon.evolutions || []
  };
}

export const pokemonService = {
  async getAllPokemons() {
    try {
      const response = await api.get('/api/pkmn');
      return response.data.data.map(formatLocalData).sort((a, b) => a.numericId - b.numericId);
    } catch (error) {
      console.error("Error fetching pokemons from local API:", error);
      return [];
    }
  },

  async getPokemon(id) {
    try {
      const allPokemons = await this.getAllPokemons();
      return allPokemons.find(p => p.id === parseInt(id)) || null;
    } catch (error) {
      console.error(`Error fetching pokemon ${id}:`, error);
      return null;
    }
  }
};
