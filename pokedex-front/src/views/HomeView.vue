<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pokemonService } from '../services/pokemonService';
import PokemonViewer from '../components/PokemonViewer.vue';
import PokemonDetailsTabs from '../components/PokemonDetailsTabs.vue';

const route = useRoute();
const router = useRouter();

const pokemons = ref([]);
const loading = ref(true);
const isShiny = ref(false);

const activePokemonId = computed(() => parseInt(route.params.id));

const currentPokemonIndex = computed(() => {
  if (!pokemons.value.length) return -1;
  return pokemons.value.findIndex(p => p.id === activePokemonId.value);
});

const currentPokemon = computed(() => {
  const index = currentPokemonIndex.value;
  return index !== -1 ? pokemons.value[index] : null;
});

const previousPokemon = computed(() => {
  const index = currentPokemonIndex.value;
  return index > 0 ? pokemons.value[index - 1] : null;
});

const nextPokemon = computed(() => {
  const index = currentPokemonIndex.value;
  return index !== -1 && index < pokemons.value.length - 1 ? pokemons.value[index + 1] : null;
});

onMounted(async () => {
  const data = await pokemonService.getAllPokemons();
  pokemons.value = data;
  loading.value = false;
});

const goNext = () => {
  if (nextPokemon.value) {
    router.push(`/pokemon/${nextPokemon.value.id}`);
  }
};

const goPrev = () => {
  if (previousPokemon.value) {
    router.push(`/pokemon/${previousPokemon.value.id}`);
  }
};

watch(activePokemonId, () => {
  isShiny.value = false;
});
</script>

<template>
  <div class="pokedex-container">
    <div v-if="loading" class="loading">Loading local Pokedex Database...</div>
    <div v-else-if="!currentPokemon" class="empty">No Pokemons found.</div>
    <div v-else class="pokedex-card">
      <div class="pokedex-split">
        <div class="pokedex-left">
          <router-link to="/" class="back-link">
            <span class="arrow">←</span> Pokedex
          </router-link>
          
          <PokemonViewer 
            :pokemon="currentPokemon" 
            :prev="previousPokemon" 
            :next="nextPokemon"
            :isShiny="isShiny"
            @next="goNext"
            @prev="goPrev"
          />
        </div>
        
        <div class="pokedex-right">
          <PokemonDetailsTabs 
            :pokemon="currentPokemon" 
            :isShiny="isShiny"
            @update:isShiny="isShiny = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokedex-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow: hidden; 
  position: relative;
}

.pokedex-card {
  width: 100%;
  max-width: 1200px;
  height: 90vh; 
  max-height: 850px;
  background: var(--c-white);
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15); 
  padding: 4rem;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1; 
}

.pokedex-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  flex: 1; 
  min-height: 0; 
}

@media (max-width: 1024px) {
  .pokedex-container {
    padding: 0; 
  }

  .pokedex-card {
    height: 100vh;
    max-height: none;
    border-radius: 0;
    padding: 1.5rem;
    overflow-y: auto; 
    display: block; 
  }

  .pokedex-split {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
}

.pokedex-left {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0; 
}

.pokedex-right {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.back-link {
  color: var(--c-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  align-self: flex-start;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.back-link .arrow {
  color: var(--c-text-primary); 
}

@media (max-width: 900px) {
  .pokedex-split {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .pokedex-card {
    padding: 2rem;
    border-radius: 30px;
  }
}
</style>
