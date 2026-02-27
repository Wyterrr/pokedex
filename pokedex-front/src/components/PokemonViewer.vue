<script setup>
import { computed } from 'vue';

const props = defineProps({
  pokemon: Object,
  prev: Object,
  next: Object,
  isShiny: Boolean
});

defineEmits(['prev', 'next']);

const activeImage = computed(() => {
  if (!props.pokemon) return '/placeholder.png';
  return props.isShiny && props.pokemon.shinyImgUrl 
    ? props.pokemon.shinyImgUrl 
    : props.pokemon.imgUrl;
});

const typeColor = computed(() => {
  const type = props.pokemon?.types?.[0]?.toLowerCase() || 'normal';
  return `var(--type-${type})`;
});
</script>

<template>
  <div class="pokemon-viewer">
    <div class="header">
      <h2 class="name">{{ pokemon.name }} <span class="id">{{ pokemon.displayId }}</span></h2>
      <div class="types">
        <span 
          v-for="type in pokemon.types" 
          :key="type" 
          class="type-badge"
          :style="{ backgroundColor: `var(--type-${type.toLowerCase()})` }"
        >
          {{ type }}
        </span>
      </div>
    </div>

    <div class="image-area">
      <div class="bg-pokeball"></div>
      
      <div v-if="prev" class="nav prev" @click="$emit('prev')">
        <span class="nav-arrow">&lt;</span>
        <div class="nav-info">
          <span class="nav-id">{{ prev.displayId }}</span>
          <span class="nav-name">{{ prev.name }}</span>
        </div>
      </div>

      <img :src="activeImage" :alt="pokemon.name" class="main-image" />

      <div v-if="next" class="nav next" @click="$emit('next')">
        <div class="nav-info">
          <span class="nav-id">{{ next.displayId }}</span>
          <span class="nav-name">{{ next.name }}</span>
        </div>
        <span class="nav-arrow">&gt;</span>
      </div>
    </div>

    <div class="evolutions-area" v-if="pokemon.evolutions && pokemon.evolutions.length > 1">
      <h3 class="evo-title">Evolutions</h3>
      <div class="evo-chain">
        <template v-for="(evo, index) in pokemon.evolutions" :key="evo.pokemonId">
          <div class="evo-item">
            <div class="evo-img-bg outline">  
            <a :href="`/pokemon/${evo.pokemonId}`" class="evo-link"><img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.pokemonId}.png`" :alt="evo.name" /></a>
            </div>
            <span class="evo-name">{{ evo.name }} <span class="evo-id">#{{ String(evo.pokemonId).padStart(3, '0') }}</span></span>
          </div>
          <div v-if="index < pokemon.evolutions.length - 1" class="evo-connector"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-viewer {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.header {
  margin-bottom: 2rem;
}

.name {
  font-size: 2.75rem;
  font-weight: 700;
  color: var(--c-text-primary);
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.id {
  font-size: 1.5rem;
  color: #a0aab8; 
  font-weight: 500;
}

.types {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.type-badge {
  padding: 0.15rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge.min {
  padding: 0.15rem 0.75rem;
  font-size: 0.75rem;
}

.image-area {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  max-height: 400px; 
  margin: 1rem 0;
}

.bg-pokeball {
  position: absolute;
  width: 90%;
  aspect-ratio: 1 / 1;
  max-width: 320px; 
  background: radial-gradient(circle, rgba(255,157,85,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.main-image {
  position: relative;
  z-index: 10;
  height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 350px; 
  object-fit: contain;
  filter: drop-shadow(0 20px 20px rgba(0,0,0,0.15));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s ease;
}
.nav:hover { transform: translateY(-50%) scale(1.05); }
.nav:active { transform: translateY(-50%) scale(0.95); }

.nav-arrow {
  color: #ff4757;
  font-size: 1.25rem;
  font-weight: bold;
}

.nav-info {
  display: flex;
  flex-direction: column;
}

.nav.prev { left: 0; }
.nav.prev .nav-info { align-items: flex-start; }

.nav.next { right: 0; }
.nav.next .nav-info { align-items: flex-end; }

.nav-id {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--c-text-primary);
}

.nav-name {
  font-size: 0.75rem;
  color: var(--c-text-secondary);
  text-transform: capitalize;
}

.evolutions-area {
  margin-top: auto;
}

.evo-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.evo-chain {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.evo-connector {
  flex: 1;
  min-width: 20px;
  height: 2px;
  background-image: linear-gradient(to right, var(--c-border-light) 50%, transparent 50%);
  background-size: 8px 10px; 
  background-repeat: repeat-x;
  margin-top: -30px; 
}

.evo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.evo-img-bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--c-white);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  align-items: center;
}

.evo-img-bg.outline {
  border: 2px solid var(--c-text-secondary);
}

.evo-img-bg img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.evo-name {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}
.evo-name .evo-id {
  color: var(--c-text-secondary);
  font-weight: normal;
}

@media (max-width: 1024px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .name {
    font-size: 2rem;
  }

  .id {
    font-size: 1.2rem;
  }

  .image-area {
    margin: 1.5rem 0; 
    min-height: 250px;
    max-height: 280px; 
  }

  .main-image {
    max-height: 220px; 
  }

  .bg-pokeball {
    width: 280px;
    height: 280px;
  }

  .nav-header {
    margin-bottom: 1rem;
  }
}
</style>
