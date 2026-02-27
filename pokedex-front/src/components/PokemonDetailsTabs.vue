<script setup>
import { ref } from 'vue';
import PokemonAboutTab from './PokemonAboutTab.vue';

const props = defineProps({
  pokemon: Object,
  isShiny: Boolean
});

const tabs = ['About'];
const activeTab = ref('About');
</script>

<template>
  <div class="details-panel" v-if="pokemon">
    <div class="tabs-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="tab-content">
      <PokemonAboutTab 
         v-if="activeTab === 'About'" 
         :pokemon="pokemon" 
         :isShiny="isShiny"
         @update:isShiny="$emit('update:isShiny', $event)"
      />
      <div v-else class="placeholder-tab">
        <p>{{ activeTab }} information is coming soon.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-panel {
  display: flex;
  flex-direction: column;
}

.tabs-nav {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--c-border-light);
  padding-bottom: 0.5rem;
  overflow-x: auto; 
  white-space: nowrap; 
  -webkit-overflow-scrolling: touch; 
}
.tabs-nav::-webkit-scrollbar {
  display: none;
}
.tabs-nav {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-btn {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text-secondary);
  position: relative;
  transition: color 0.3s ease;
  padding-bottom: 0.5rem;
}

.tab-btn:hover {
  color: var(--c-text-primary);
}

.tab-btn.active {
  color: var(--c-text-primary);
  font-weight: 700;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--c-text-primary); 
}

.tab-content {
  flex: 1;
}

.placeholder-tab {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--c-text-secondary);
  font-style: italic;
  font-size: 1.1rem;
}
</style>
