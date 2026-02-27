<script setup>
import { computed, ref, onUnmounted } from 'vue';

const props = defineProps({
  pokemon: Object,
  isShiny: Boolean
});

const isSpeaking = ref(false);

const playCry = () => {
    // Cri du pokemon en fonction de son ID
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${props.pokemon.id}.ogg`);
    audio.play().catch(e => console.error("Audio play failed:", e));
};

const speakStory = () => {
    if (isSpeaking.value) {
        window.speechSynthesis.cancel();
        isSpeaking.value = false;
        return;
    }

    const utterance = new SpeechSynthesisUtterance(props.pokemon.description);
    
    // Essayer de trouver une voix française
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;
    
    utterance.onend = () => {
        isSpeaking.value = false;
    };
    
    isSpeaking.value = true;
    window.speechSynthesis.speak(utterance);
};

onUnmounted(() => {
    window.speechSynthesis.cancel();
});

defineEmits(['update:isShiny']);

const statsMap = [
  { label: 'HP', key: 'hp' },
  { label: 'Attack', key: 'attack' },
  { label: 'Defense', key: 'defense' },
  { label: 'Sp. Attack', key: 'spAttack' },
  { label: 'Sp. Defense', key: 'spDefense' },
  { label: 'Speed', key: 'speed' },
];

const totalStats = computed(() => {
  if (!props.pokemon?.stats) return 100;
  // Calculer une plage de statistiques maximale raisonnable (par exemple, sur 100 pour la visualisation de la barre de progression)
  return 150; 
});
</script>

<template>
  <div class="about-tab" v-if="pokemon">
    <!-- Weaknesses -->
    <section class="section">
      <h3 class="section-title">Weaknesses</h3>
      <div class="weaknesses-list">
        <span 
          v-for="wk in pokemon.weaknesses" 
          :key="wk"
          class="weakness-badge"
          :style="{ backgroundColor: `var(--type-${wk})` }"
        >
          {{ wk }}
        </span>
      </div>
    </section>

    <!-- Story -->
    <section class="section story-section">
      <div class="story-header">
        <h3 class="section-title">Story</h3>
        <div class="audio-controls">
          <button @click="playCry" class="audio-btn cry-btn" title="Écouter le cri">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            Cry
          </button>
          <button @click="speakStory" class="audio-btn speech-btn" :class="{ speaking: isSpeaking }" title="Lire la description">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            {{ isSpeaking ? 'Stop' : 'Read' }}
          </button>
        </div>
      </div>
      <p class="story-text">{{ pokemon.description }}</p>
    </section>

    <!-- Versions -->
    <section class="section">
      <h3 class="section-title">Versions</h3>
      <div class="versions-toggle">
        <button 
          class="version-btn" 
          :class="{ active: !isShiny }"
          @click="$emit('update:isShiny', false)"
        >Normal</button>
        <button 
          class="version-btn" 
          :class="{ active: isShiny }"
          @click="$emit('update:isShiny', true)"
        >Shiny</button>
      </div>
    </section>

    <!-- Grid Characteristics -->
    <section class="characteristics-grid">
      <div class="char-box">
        <span class="char-label">Height</span>
        <span class="char-val">{{ pokemon.height }}</span>
      </div>
      <div class="char-box">
        <span class="char-label">Category</span>
        <span class="char-val">{{ pokemon.category }}</span>
      </div>
      <div class="char-box">
        <span class="char-label">Gender</span>
        <span class="char-val gender-icons">
          <span class="male" v-if="pokemon.gender.male">♂</span>
          <span class="female" v-if="pokemon.gender.female">♀</span>
        </span>
      </div>
      <div class="char-box">
        <span class="char-label">Weight</span>
        <span class="char-val">{{ pokemon.weight }}</span>
      </div>
      <div class="char-box">
        <span class="char-label">Abilities</span>
        <span class="char-val">{{ pokemon.abilities.join(', ') }}</span>
      </div>
    </section>

    <!-- Stats -->
    <section class="section stats-section">
      <h3 class="section-title">Stats</h3>
      <div class="stats-list">
        <div class="stat-row" v-for="stat in statsMap" :key="stat.key">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-val">{{ pokemon.stats[stat.key] }}</span>
          <div class="stat-bar-bg">
             <div 
                class="stat-bar-fill" 
                :class="{ low: pokemon.stats[stat.key] < 50, high: pokemon.stats[stat.key] > 80 }"
                :style="{ width: `${(pokemon.stats[stat.key] / totalStats) * 100}%` }"
             ></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-tab {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; 
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--c-text-primary);
}

.weaknesses-list {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.weakness-badge {
  padding: 0.2rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  box-shadow: var(--btn-shadow);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.audio-controls {
  display: flex;
  gap: 0.5rem;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  color: var(--c-text-primary);
}

.audio-btn:hover {
  background: white;
  border-color: var(--type-normal);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.audio-btn svg {
  width: 14px;
  height: 14px;
}

.cry-btn:hover {
  color: #559ed0;
  border-color: #559ed0;
}

.speech-btn.speaking {
  background: #5dba7d;
  color: white;
  border-color: #5dba7d;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.story-text {
  font-size: 0.85rem;
  color: var(--c-text-secondary);
  line-height: 1.4;
}

.versions-toggle {
  display: flex;
  gap: 1.5rem;
}

.version-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text-secondary);
  position: relative;
  transition: all 0.2s ease;
}

.version-btn.active {
  color: var(--type-normal);
  padding: 0.2rem 1rem;
  border: 1px solid var(--type-normal);
  border-radius: 20px;
}

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.char-box {
  background: white;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05); /* Softer shadow per mockup */
  border: 1px solid rgba(0,0,0,0.05); /* Softer border per mockup */
}

.char-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-text-secondary);
}

.char-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text-primary);
  text-align: center;
}

.gender-icons {
  display: flex;
  gap: 0.5rem;
}

.gender-icons .male { color: #559ed0; font-weight: bold; }
.gender-icons .female { color: #f97177; font-weight: bold; }

/* Stats Setup */
.stats-section {
  margin-top: 1rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-label {
  width: 80px;
  font-size: 0.75rem;
  color: var(--c-text-secondary);
  font-weight: 600;
}

.stat-val {
  width: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-text-primary);
  text-align: right;
}

.stat-bar-bg {
  flex: 1;
  height: 4px; /* Thinner line per mockup */
  background: #f0f0f0; /* Lighter background track */
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: #5dba7d; /* Default green */
  border-radius: 2px;
  transition: width 0.5s ease;
}

.stat-bar-fill.low { background: #ff7171; } /* Specific Red for low from mockup */
.stat-bar-fill.high { background: #5dba7d; } /* Keep it green, mockup uses green for 60+ */

@media (max-width: 600px) {
  .characteristics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
