<template>
  <div class="pokemon-list">
    <h2>Liste des Pokémon</h2>
    <div v-if="loading" class="loading">Chargement en cours...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error" class="grid">
      <div v-for="pokemon in pokemons" :key="pokemon._id || pokemon.id" class="card">
        <h3>{{ pokemon.name }}</h3>
        <p><strong>Types:</strong> {{ pokemon.types ? pokemon.types.join(', ') : 'N/A' }}</p>
        <p><strong>HP:</strong> {{ pokemon.hp }} | <strong>CP:</strong> {{ pokemon.cp }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const pokemons = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await api.get('/api/pkmn');
    pokemons.value = response.data.data || response.data;
  } catch (err) {
    error.value = "Erreur lors de la récupération des Pokémon.";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pokemon-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.card h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.4rem;
}
.card p {
  color: #555;
  margin: 0.5rem 0 0;
  font-size: 1rem;
}
.loading, .error {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 3rem;
  font-weight: bold;
}
.error {
  color: #e74c3c;
}
.loading {
  color: #3498db;
}
</style>
