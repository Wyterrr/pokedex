<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  trainer: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const tabs = ['Vus', 'Capturés'];
const activeTab = ref('Vus');

const getNumericId = (pokemon) => {
  if (pokemon.regions && pokemon.regions.length > 0) {
    return pokemon.regions[0].regionPokedexNumber;
  }
  let hash = 0;
  for (let i = 0; i < pokemon.name.length; i++) {
    hash = pokemon.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 151) + 1;
};

const goToDetail = (pokemon) => {
  const numId = getNumericId(pokemon);
  router.push(`/pokemon/${numId}`);
};
</script>

<template>
  <div class="details-panel">
    <div class="tabs-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }} 
        <span class="count-badge" v-if="tab === 'Vus'">{{ trainer.pkmnSeen?.length || 0 }}</span>
        <span class="count-badge" v-if="tab === 'Capturés'">{{ trainer.pkmnCatch?.length || 0 }}</span>
      </button>
    </div>

    <div class="tab-content scrollable-content">
      
      <div v-if="activeTab === 'Vus'" class="pokemon-grid">
        <div v-if="!trainer.pkmnSeen?.length" class="empty-state">
          Aucun Pokémon vu pour le moment.
        </div>
        <div 
          v-else
          v-for="pokemon in trainer.pkmnSeen" 
          :key="'seen-'+pokemon._id"
          class="pokemon-card-mini"
          @click="goToDetail(pokemon)"
        >
          <div class="mini-img-container">
            <img :src="pokemon.imgUrl" :alt="pokemon.name" loading="lazy" />
          </div>
          <span class="mini-id">{{ pokemon.displayId }}</span>
          <span class="mini-name">{{ pokemon.name }}</span>
        </div>
      </div>

      <div v-if="activeTab === 'Capturés'" class="pokemon-grid">
        <div v-if="!trainer.pkmnCatch?.length" class="empty-state">
          Aucun Pokémon capturé pour le moment.
        </div>
        <div 
          v-else
          v-for="pokemon in trainer.pkmnCatch" 
          :key="'catch-'+pokemon._id"
          class="pokemon-card-mini catch-card"
          @click="goToDetail(pokemon)"
        >
          <div class="mini-img-container">
            <img :src="pokemon.imgUrl" :alt="pokemon.name" loading="lazy" />
          </div>
          <span class="mini-id">{{ pokemon.displayId }}</span>
          <span class="mini-name">{{ pokemon.name }}</span>
          <div class="pokeball-badge"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.details-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tabs-nav {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.tab-btn {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  transition: all 0.3s ease;
  padding-bottom: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.tab-btn.active {
  color: var(--c-white);
  font-weight: 800;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--c-white);
  border-radius: 3px 3px 0 0;
}

.count-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.1rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
}

.tab-btn.active .count-badge {
    background: var(--c-white);
    color: #2193b0;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 0.5rem;
}

/* Custom Scrollbar */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}
.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem;
  padding-bottom: 1rem;
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
    background: rgba(0,0,0,0.05);
    border-radius: 20px;
    border: 1px dashed rgba(255,255,255,0.2);
}

.pokemon-card-mini {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.pokemon-card-mini:hover {
    transform: translateY(-5px) scale(1.02);
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.mini-img-container {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
}

.mini-img-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
  transition: transform 0.2s ease;
}

.pokemon-card-mini:hover .mini-img-container img {
    transform: scale(1.15);
}

.mini-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.mini-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--c-white);
  text-transform: capitalize;
  text-align: center;
}

.catch-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 71, 87, 0.1) 100%);
    border-color: rgba(255, 71, 87, 0.3);
}

.pokeball-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 30px;
    height: 30px;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23ff4757' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='white'/%3E%3Cpath d='M2 12h20'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/g%3E%3C/svg%3E");
    background-size: cover;
    opacity: 0.8;
    transform: rotate(15deg);
}

.catch-card:hover .pokeball-badge {
    opacity: 1;
    transform: rotate(0deg) scale(1.1);
}
</style>
