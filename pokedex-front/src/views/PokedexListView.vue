<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { pokemonService } from '../services/pokemonService';
import { trainerService } from '../services/trainerService';

const router = useRouter();
const authStore = useAuthStore();
const pokemons = ref([]);
const caughtPokemonIds = ref(new Set());
const loading = ref(true);
const searchQuery = ref('');
const revealAll = ref(false);
const filterCaught = ref(false);
const filterSeen = ref(false);
const selectedType = ref(null);
const seenPokemonIds = ref(new Set());
const viewMode = ref('grid');
const mobileFiltersOpen = ref(false);

onMounted(async () => {
  try {
    const data = await pokemonService.getAllPokemons();
    pokemons.value = data;
    
    if (authStore.isAuthenticated) {
        const profile = await trainerService.getTrainerProfile();
        if (profile) {
            if (profile.pkmnCatch) {
                const ids = profile.pkmnCatch.map(p => p._id || p.id);
                caughtPokemonIds.value = new Set(ids);
            }
            if (profile.pkmnSeen) {
                const ids = profile.pkmnSeen.map(p => p._id || p.id);
                seenPokemonIds.value = new Set(ids);
            }
        }
    }
  } catch(e) {
      console.error(e);
  } finally {
      loading.value = false;
  }
});

const isCaught = (pokemon) => {
    if (!authStore.isAuthenticated) return true;
    if (revealAll.value) return true;
    return caughtPokemonIds.value.has(pokemon._id);
};

const isSeen = (pokemon) => {
    if (!authStore.isAuthenticated) return true;
    if (revealAll.value) return true;
    return seenPokemonIds.value.has(pokemon._id) || caughtPokemonIds.value.has(pokemon._id);
};

const allTypes = computed(() => {
  const set = new Set();
  for (const p of pokemons.value) {
    for (const t of p.types || []) {
      set.add(t);
    }
  }
  return [...set].sort();
});

const toggleType = (type) => {
  selectedType.value = selectedType.value === type ? null : type;
};

const filteredPokemons = computed(() => {
  let list = pokemons.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.displayId.includes(q)
    );
  }

  if (selectedType.value) {
    const t = selectedType.value.toLowerCase();
    list = list.filter(p =>
      p.types?.some(pt => pt.toLowerCase() === t)
    );
  }

  if (filterCaught.value) {
    list = list.filter(p => caughtPokemonIds.value.has(p._id));
  }
  if (filterSeen.value) {
    list = list.filter(p => seenPokemonIds.value.has(p._id));
  }

  return list;
});

const goToDetail = (pokemon) => {
  if (authStore.isAuthenticated && !isCaught(pokemon) && !revealAll.value) {
    router.push(`/safari`);
  } else {
    router.push(`/pokemon/${pokemon.id}`);
  }
};
</script>

<template>
  <div class="pokedex-container">
    <div class="pokedex-card">
      <div class="header">
        <div class="toolbar">

          <div class="tb-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Rechercher un Pokémon…"
              class="tb-input"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
          </div>
          
          <button class="mobile-filter-btn" @click="mobileFiltersOpen = !mobileFiltersOpen" :class="{ active: mobileFiltersOpen }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filtres
          </button>

          <div class="tb-view-controls">
            <button 
              class="view-btn" 
              :class="{ active: viewMode === 'grid' }" 
              @click="viewMode = 'grid'"
              title="Vue Grille"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              class="view-btn" 
              :class="{ active: viewMode === 'list' }" 
              @click="viewMode = 'list'"
              title="Vue Liste"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="filters-drawer" :class="{ 'is-open': mobileFiltersOpen }">
            <div class="tb-divider desktop-only"></div>

          <div class="tb-select-wrap">
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <select class="tb-select" v-model="selectedType">
              <option :value="null">Tous les types</option>
              <option v-for="type in allTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <template v-if="authStore.isAuthenticated">
            <div class="tb-divider"></div>

            <label class="tb-toggle" :class="{ active: revealAll }">
              <span class="toggle-label">Tout révéler</span>
              <div class="toggle-track" @click="revealAll = !revealAll">
                <div class="toggle-thumb"></div>
              </div>
            </label>

            <div class="tb-divider"></div>

            <label class="tb-toggle" :class="{ active: filterCaught }">
              <span class="toggle-label">Capturés</span>
              <div class="toggle-track" @click="filterCaught = !filterCaught">
                <div class="toggle-thumb"></div>
              </div>
            </label>

            <div class="tb-divider"></div>

            <label class="tb-toggle" :class="{ active: filterSeen }">
              <span class="toggle-label">Vus</span>
              <div class="toggle-track" @click="filterSeen = !filterSeen">
                <div class="toggle-thumb"></div>
              </div>
            </label>
          </template>
          </div>
        </div>
      </div>

      <div class="scrollable-content">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading Pokédex...</p>
        </div>
        
        <div v-else>
          <div v-if="viewMode === 'grid'" class="pokemon-grid">
            <div 
              v-for="pokemon in filteredPokemons" 
              :key="pokemon._id"
              class="pokemon-card"
              :class="[
                { 'uncaught': authStore.isAuthenticated && !isCaught(pokemon) },
                { 'seen': authStore.isAuthenticated && isSeen(pokemon) && !isCaught(pokemon) },
                `type-${(pokemon.types?.[0] || 'normal').toLowerCase()}`
              ]"
              @click="goToDetail(pokemon)"
            >
              <div class="card-image">
                <img :src="pokemon.imgUrl" :alt="pokemon.name" class="p-img" loading="lazy" />
                <div v-if="authStore.isAuthenticated && !isSeen(pokemon)" class="p-mystery">?</div>
              </div>

              <div class="card-info">
                <h2 class="p-name">{{ pokemon.name }}</h2>
                <span class="p-id">{{ pokemon.displayId }}</span>
              </div>
              
              <div class="card-types" v-if="!authStore.isAuthenticated || isCaught(pokemon)">
                <span 
                  v-for="type in pokemon.types" 
                  :key="type"
                  class="p-type-tag"
                  :style="{ backgroundColor: `var(--type-${type.toLowerCase()})` }"
                >
                  {{ type }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="pokemon-rows">
            <div 
              v-for="pokemon in filteredPokemons" 
              :key="pokemon._id"
              class="pokemon-row"
              :class="[
                { 'uncaught': authStore.isAuthenticated && !isCaught(pokemon) },
                { 'seen': authStore.isAuthenticated && isSeen(pokemon) && !isCaught(pokemon) }
              ]"
              @click="goToDetail(pokemon)"
            >
              <div class="row-image">
                <div class="row-bg-decoration"></div>
                <img :src="pokemon.imgUrl" :alt="pokemon.name" class="p-img" loading="lazy" />
                <div v-if="authStore.isAuthenticated && !isSeen(pokemon)" class="p-mystery">?</div>
              </div>

              <div class="row-info">
                <span class="p-id">{{ pokemon.displayId }}</span>
                <h2 class="p-name">{{ pokemon.name }}</h2>
              </div>
              
              <div class="row-types">
                <span 
                  v-for="type in pokemon.types" 
                  :key="type"
                  class="p-type"
                  :style="{ backgroundColor: `var(--type-${type.toLowerCase()})` }"
                >
                  {{ type }}
                </span>
              </div>

              <div class="row-action">
                <div class="caught-status" v-if="authStore.isAuthenticated">
                  <svg v-if="isCaught(pokemon)" viewBox="0 0 24 24" fill="none" stroke="#5dba7d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else class="uncaught-dot"></span>
                </div>
                <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div v-if="filteredPokemons.length === 0" class="no-results">
            Aucun Pokémon ne correspond à "{{ searchQuery }}"
          </div>
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
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.header {
  width: 100%;
  margin-bottom: 2rem;
  flex-shrink: 0;
  position: relative;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f5f7fa;
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 0.4rem 0.6rem;
  width: 100%;
  position: relative;
}

.mobile-filter-btn {
  display: none;
}

.tb-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.4rem;
  min-width: 0;
}

.search-icon {
  width: 18px; height: 18px;
  color: var(--c-text-secondary);
  flex-shrink: 0;
}

.tb-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--c-text-primary);
  outline: none;
  min-width: 0;
}
.tb-input::placeholder { color: var(--c-text-secondary); }

.clear-btn {
  background: var(--c-border);
  border: none;
  border-radius: 50%;
  width: 20px; height: 20px;
  font-size: 0.65rem;
  cursor: pointer;
  color: var(--c-text-secondary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.clear-btn:hover { background: #ddd; color: var(--c-text-primary); }

.tb-divider {
  width: 1px; height: 28px;
  background: var(--c-border);
  flex-shrink: 0;
  margin: 0 0.25rem;
}

.tb-select-wrap {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0 0.4rem;
  flex-shrink: 0;
}
.filter-icon {
  width: 15px; height: 15px;
  color: var(--c-text-secondary);
  flex-shrink: 0;
}
.tb-select {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--c-text-primary);
  cursor: pointer;
  outline: none;
  padding: 0.4rem 0.2rem;
  max-width: 140px;
}

.tb-toggle {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.2rem 0.5rem 0.2rem 0.6rem;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}
.toggle-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--c-text-secondary);
  transition: color 0.2s;
  white-space: nowrap;
}
.tb-toggle.active .toggle-label { color: #2193b0; }

.toggle-track {
  width: 38px; height: 22px;
  background: var(--c-border);
  border-radius: 11px;
  position: relative;
  transition: background 0.25s;
  flex-shrink: 0;
}
.tb-toggle.active .toggle-track { background: #2193b0; }

.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(.22,1,.36,1);
}
.tb-toggle.active .toggle-thumb { transform: translateX(16px); }

.tb-view-controls {
  display: flex;
  gap: 0.2rem;
  padding: 0 0.4rem;
}

.view-btn {
  width: 32px; height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn svg { width: 18px; height: 18px; }

.view-btn:hover { background: rgba(0,0,0,0.03); color: var(--c-text-primary); }
.view-btn.active { color: #2193b0; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

.filters-drawer {
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 30px;
  background: #fafafa;
  border: 1px solid rgba(0,0,0,0.05);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  background: white;
  border-color: var(--type-normal);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 1rem;
}

.scrollable-content::-webkit-scrollbar {
  width: 8px;
}
.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--c-border-light);
  border-radius: 10px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--c-text-secondary);
  font-size: 1.2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-left-color: #ff4757;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}


.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  padding-bottom: 2.5rem;
}

.pokemon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.75rem;
  border-radius: 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.03);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.pokemon-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

.card-image {
  width: 100%; height: 180px;
  display: flex; justify-content: center; align-items: center;
  margin-bottom: 1rem; position: relative;
  z-index: 5;
}

.card-image .p-img {
  width: auto;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 15px 25px rgba(0,0,0,0.12));
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: scale(1.1);
}
.pokemon-card:hover .p-img { transform: scale(1.25) translateY(-5px); }

.card-info { display: flex; flex-direction: column; gap: 0.3rem; }
.card-info .p-name { font-size: 1.75rem; font-weight: 800; color: #2c3e50; text-transform: capitalize; margin: 0; }
.card-info .p-id { font-size: 1.1rem; font-weight: 600; color: #a0aab8; }

.card-types { margin-top: 1.2rem; display: flex; gap: 0.5rem; justify-content: center; }
.p-type-tag {
  font-size: 0.7rem; font-weight: 800; color: white;
  padding: 0.3rem 0.8rem; border-radius: 10px;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.pokemon-card.uncaught .p-img { filter: brightness(0) blur(4px); opacity: 0.4; }
.pokemon-card.uncaught.seen .p-img { filter: none; opacity: 1; }
.pokemon-card.uncaught .p-name { color: transparent; text-shadow: 0 0 10px rgba(0,0,0,0.3); user-select: none; }
.pokemon-card.uncaught .p-mystery {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 2.5rem; font-weight: 900; color: rgba(0,0,0,0.1); pointer-events: none;
}

@media (max-width: 768px) {
  .pokedex-container {
    padding: 1rem;
  }
  
  .pokedex-card {
    padding: 1rem;
    height: 100%;
    max-height: none;
    border-radius: 20px;
  }

  .toolbar {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .tb-search {
    width: 65%;
    flex: none;
  }

  .desktop-only {
    display: none;
  }

  .mobile-filter-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--c-border);
    background: white;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--c-text-primary);
    cursor: pointer;
  }
  .mobile-filter-btn svg { width: 14px; height: 14px; }
  .mobile-filter-btn.active { background: rgba(33, 147, 176, 0.1); color: #2193b0; border-color: #2193b0; }

  .filters-drawer {
    display: none;
    flex-direction: column;
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--c-border);
    gap: 0.8rem;
    align-items: flex-start;
  }

  .filters-drawer.is-open {
    display: flex;
  }

  .tb-select-wrap {
    width: 100%;
    justify-content: flex-start;
    padding: 0.4rem 0.2rem;
  }
  
  .tb-toggle {
    width: 100%;
    justify-content: space-between;
    padding: 0.6rem 0.2rem;
  }

  .pokemon-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding-bottom: 6rem;
  }

  .pokemon-card {
    padding: 1.5rem;
    border-radius: 24px;
    flex-direction: row;
    text-align: left;
    gap: 1.5rem;
  }

  .card-image {
    height: 100px;
    width: 100px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;
    align-items: flex-start;
  }

  .card-types {
    margin-top: 0.5rem;
    justify-content: flex-start;
  }

  .card-image .p-img {
    transform: scale(1.1);
  }
  .pokemon-card:hover .p-img { transform: scale(1.15) translateY(-2px); }

  .card-info .p-name {
    font-size: 1.4rem;
  }
  .card-info .p-id {
    font-size: 0.9rem;
  }

  }

  .card-types {
    margin-top: 0.8rem;
    flex-wrap: wrap;
  }
  .p-type-tag {
    font-size: 0.6rem;
    padding: 0.2rem 0.5rem;
  }


.pokemon-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2.5rem;
}

.pokemon-row {
  display: flex;
  align-items: center;
  background: #f8f9fb;
  border: 1px solid rgba(0,0,0,0.02);
  border-radius: 20px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 1.5rem;
}

.pokemon-row:hover {
  background: white;
  transform: translateX(8px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border-color: rgba(0,0,0,0.05);
}

.row-image {
  width: 60px; height: 60px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.row-bg-decoration {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: white;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.05);
}

.p-img {
  width: 48px; height: 48px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.2s;
}
.pokemon-row:hover .p-img { transform: scale(1.15) rotate(5deg); }

.row-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.p-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: #a0aab8;
  margin-bottom: 0.1rem;
}
.p-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--c-text-primary);
  text-transform: capitalize;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-types {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}
.p-type {
  padding: 0.2rem 0.8rem;
  border-radius: 12px;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
}

.row-action {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-shrink: 0;
  padding-left: 0.5rem;
}

.caught-status svg {
  width: 20px; height: 20px;
}
.uncaught-dot {
  width: 8px; height: 8px;
  background: #cbd5e0;
  border-radius: 50%;
  display: block;
}

.chevron {
  width: 18px; height: 18px;
  color: #cbd5e0;
  transition: color 0.2s, transform 0.2s;
}
.pokemon-row:hover .chevron {
  color: var(--c-text-primary);
  transform: translateX(3px);
}

.pokemon-row.uncaught {
  background: rgba(0, 0, 0, 0.02);
}
.pokemon-row.uncaught .p-img {
  filter: brightness(0) blur(3px);
  opacity: 0.5;
}
.pokemon-row.uncaught.seen .p-img {
  filter: none;
  opacity: 1;
}
.pokemon-row.uncaught .p-name {
  color: transparent;
  text-shadow: 0 0 8px rgba(0,0,0,0.3);
  user-select: none;
}
.pokemon-row.uncaught .row-types {
  opacity: 0;
}
.pokemon-row.uncaught .p-mystery {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 900;
  color: rgba(0,0,0,0.2);
  z-index: 5;
}

.no-results {
  text-align: center;
  padding: 5rem;
  color: var(--c-text-secondary);
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .row-types { display: none; }
  .pokemon-row { gap: 1rem; }
}

</style>
