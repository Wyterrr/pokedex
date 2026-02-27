<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { pokemonService } from '../services/pokemonService';
import { trainerService } from '../services/trainerService';

const router = useRouter();
const authStore = useAuthStore();

const queue = ref([]);
const loading = ref(true);
const totalSeen = ref(0);
const totalCaught = ref(0);

const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);
const startY = ref(0);
const currentY = ref(0);
const THRESHOLD = 100;

const flyOffDir = ref(null);
const isAnimating = ref(false);

const toast = ref(null);

const TYPE_COLORS = {
    FIRE: '#ff9d55', FEU: '#ff9d55',
    WATER: '#559ed0', EAU: '#559ed0',
    GRASS: '#5dba7d', PLANTE: '#5dba7d',
    ELECTRIC: '#f3d23b', ELECTRIK: '#f3d23b',
    ICE: '#7addd1', GLACE: '#7addd1',
    FIGHTING: '#ce4069', COMBAT: '#ce4069',
    POISON: '#ab6ac8',
    GROUND: '#d97845', SOL: '#d97845',
    FLYING: '#8faadd', VOL: '#8faadd',
    PSYCHIC: '#f97177', PSY: '#f97177',
    BUG: '#91c12f', INSECTE: '#91c12f',
    ROCK: '#c5b78c', ROCHE: '#c5b78c',
    GHOST: '#5269ad', SPECTRE: '#5269ad',
    DRAGON: '#0a6dc3',
    DARK: '#5a5366', TENEBRES: '#5a5366',
    STEEL: '#5a8ea2', ACIER: '#5a8ea2',
    FAIRY: '#ec8fe6', FEE: '#ec8fe6',
    NORMAL: '#919aa2',
};

const getTypeColor = (type) => TYPE_COLORS[type?.toUpperCase()] || '#919aa2';

const cardGradient = (pokemon) => {
    const c1 = getTypeColor(pokemon?.types?.[0]);
    const c2 = getTypeColor(pokemon?.types?.[1]) || c1;
    return `linear-gradient(180deg, ${c1}, ${c2})`;
};

onMounted(async () => {
    if (!authStore.isAuthenticated) { router.push('/login'); return; }
    try {
        const all = await pokemonService.getAllPokemons();
        queue.value = [...all].sort(() => Math.random() - 0.5).slice(0, 60);
    } finally {
        loading.value = false;
    }
});

const topCard  = computed(() => queue.value[0] || null);
const nextCard = computed(() => queue.value[1] || null);

const dragOffset   = computed(() => currentX.value - startX.value);
const cardRotation = computed(() => dragOffset.value * 0.05);
const dragProgress = computed(() => Math.min(Math.abs(dragOffset.value) / THRESHOLD, 1));
const goingRight   = computed(() => dragOffset.value > 30);
const goingLeft    = computed(() => dragOffset.value < -30);

const onDown = (e) => {
    if (isAnimating.value) return;
    isDragging.value = true;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startX.value = x; currentX.value = x;
    startY.value = y; currentY.value = y;
};
const onMove = (e) => {
    if (!isDragging.value) return;
    currentX.value = e.clientX ?? e.touches?.[0]?.clientX ?? currentX.value;
    currentY.value = e.clientY ?? e.touches?.[0]?.clientY ?? currentY.value;
};
const onUp = async () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    const off = dragOffset.value;
    
    if (off > THRESHOLD) await triggerSwipe('right');
    else if (off < -THRESHOLD) await triggerSwipe('left');
    
    currentX.value = startX.value; 
};

const triggerSwipe = async (dir) => {
    if (!topCard.value || isAnimating.value) return;
    isAnimating.value = true;
    flyOffDir.value = dir;

    await sleep(400);

    const card = queue.value.shift();
    flyOffDir.value = null;
    isAnimating.value = false;

    totalSeen.value++;
    try { await trainerService.markPokemon(card._id, false); } catch {}

    if (dir === 'right') {
        const ok = Math.random() > 0.5;
        showToast(ok ? 'caught' : 'missed');
        if (ok) { totalCaught.value++; try { await trainerService.markPokemon(card._id, true); } catch {} }
    } else {
        showToast('fled');
    }
};

const showToast = (type) => {
    toast.value = type;
    setTimeout(() => { toast.value = null; }, 2000);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const pct = (val) => Math.min(Math.round((val / 255) * 100), 100) + '%';
</script>

<template>
  <div class="safari-page">
    
    <div class="safari-bg-blobs">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
    </div>

    <div v-if="loading" class="load-screen">
      <div class="pokeball-loading"></div>
      <p>Exploration des hautes herbes...</p>
    </div>

    <template v-else>
      <header class="safari-header">
        <div class="header-left">
          <h1>PokéSwipe</h1>
          <p>Safari Zone</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <span class="label">Vus</span>
            <span class="value">{{ totalSeen }}</span>
          </div>
          <div class="stat-pill caught">
            <span class="label">Capturés</span>
            <span class="value">{{ totalCaught }}</span>
          </div>
        </div>
      </header>

      <main 
        class="swipe-stage"
        @mousedown="onDown" @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp"
        @touchstart.passive="onDown" @touchmove.passive="onMove" @touchend="onUp"
      >
        <div v-if="!topCard" class="safari-empty">
          <div class="empty-icon">🎒</div>
          <h2>Sac vide !</h2>
          <p>Vous avez exploré toute la zone pour aujourd'hui.</p>
          <router-link to="/" class="btn-primary">Retour au Pokédex</router-link>
        </div>

        <template v-else>
          <div v-if="nextCard" class="card-dummy card-back-1"></div>
          <div v-if="nextCard" class="card-dummy card-back-2"></div>

          <div 
            class="encounter-card"
            :class="{ 
              'fly-right': flyOffDir === 'right', 
              'fly-left': flyOffDir === 'left',
              'dragging': isDragging 
            }"
            :style="{
              transform: (!flyOffDir && isDragging) 
                ? `translateX(${dragOffset}px) translateY(${(currentY - startY) * 0.2}px) rotate(${cardRotation}deg)`
                : undefined
            }"
          >
            <div class="swipe-label catch" :style="{ opacity: goingRight ? dragProgress : 0 }">CATCH</div>
            <div class="swipe-label flee" :style="{ opacity: goingLeft ? dragProgress : 0 }">FLEE</div>

            <div class="card-visual" :style="{ background: cardGradient(topCard) }">
              <div class="visual-decor">
                <div class="circle c1"></div>
                <div class="circle c2"></div>
              </div>
              <img :src="topCard.imgUrl" :alt="topCard.name" class="main-sprite" draggable="false" />
              <div class="type-tags">
                <span v-for="t in topCard.types" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>

            <div class="card-details">
              <div class="details-header">
                <span class="p-id">{{ topCard.displayId }}</span>
                <h2 class="p-name">{{ topCard.name }}</h2>
              </div>
              
              <div class="p-stats">
                <div class="stat-row">
                  <span class="s-label">HP</span>
                  <div class="s-track"><div class="s-fill hp" :style="{ width: pct(topCard.stats?.hp || 50) }"></div></div>
                </div>
                <div class="stat-row">
                  <span class="s-label">ATK</span>
                  <div class="s-track"><div class="s-fill atk" :style="{ width: pct(topCard.stats?.attack || 50) }"></div></div>
                </div>
                <div class="stat-row">
                  <span class="s-label">DEF</span>
                  <div class="s-track"><div class="s-fill def" :style="{ width: pct(topCard.stats?.defense || 50) }"></div></div>
                </div>
              </div>

              <div class="swipe-hint">
                <span>← Fuir</span>
                <div class="hint-dot"></div>
                <span>Attraper →</span>
              </div>
            </div>
          </div>
        </template>
      </main>

      <footer class="safari-actions" v-if="topCard">
        <button class="action-btn-circle flee" @click="triggerSwipe('left')" :disabled="isAnimating">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button class="action-btn-circle catch" @click="triggerSwipe('right')" :disabled="isAnimating">
          <div class="pokeball-icon-small"></div>
        </button>
      </footer>
    </template>

    <transition name="pop">
      <div v-if="toast" class="safari-toast" :class="toast">
        <span v-if="toast==='caught'">✨ Capturé !</span>
        <span v-if="toast==='missed'">💨 Échappé...</span>
        <span v-if="toast==='fled'">🏃 En sécurité</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.safari-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

.safari-bg-blobs {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}
.blob {
  position: absolute;
  filter: blur(80px);
  opacity: 0.4;
  border-radius: 50%;
}
.blob.b1 { width: 400px; height: 400px; background: #56d9a1; top: -100px; right: -50px; }
.blob.b2 { width: 500px; height: 500px; background: #2193b0; bottom: -100px; left: -100px; }

.safari-header {
  padding: 2rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}
.safari-header h1 { color: white; font-size: 1.8rem; font-weight: 800; margin: 0; }
.safari-header p { color: rgba(255,255,255,0.7); margin: 0; font-size: 0.9rem; font-weight: 600; }

.header-stats { display: flex; gap: 1rem; }
.stat-pill {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}
.stat-pill .label { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; }
.stat-pill .value { font-size: 1.1rem; font-weight: 800; color: white; }
.stat-pill.caught .value { color: #56d9a1; }

.swipe-stage {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  perspective: 1000px;
  cursor: grab;
}
.swipe-stage:active { cursor: grabbing; }

.encounter-card {
  width: min(380px, 90vw);
  height: min(620px, 75vh);
  background: white;
  border-radius: 40px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 5;
  will-change: transform;
}
.encounter-card.dragging { transition: none; }
.encounter-card:not(.dragging):not(.fly-left):not(.fly-right) {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-dummy {
  position: absolute;
  width: min(380px, 90vw);
  height: min(620px, 75vh);
  background: white;
  border-radius: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}
.card-back-1 { transform: translateY(15px) scale(0.95); opacity: 0.6; z-index: 3; }
.card-back-2 { transform: translateY(30px) scale(0.9); opacity: 0.3; z-index: 2; }

.card-visual {
  height: 60%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.visual-decor .circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
}
.circle.c1 { width: 280px; height: 280px; }
.circle.c2 { width: 380px; height: 380px; }

.main-sprite {
  width: 75%;
  height: 75%;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.25));
  animation: float 4s ease-in-out infinite;
}

.type-tags {
  position: absolute;
  bottom: 1.5rem;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 3;
}
.tag {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  padding: 0.3rem 1rem;
  border-radius: 100px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.card-details {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.details-header { text-align: center; }
.p-id { font-size: 0.9rem; font-weight: 700; color: #cbd5e0; letter-spacing: 1px; }
.p-name { font-size: 2.2rem; font-weight: 900; color: #2c3e50; text-transform: capitalize; margin: 0.2rem 0; }

.p-stats { margin: 1.5rem 0; }
.stat-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.6rem; }
.s-label { font-size: 0.7rem; font-weight: 800; color: #7f8c8d; width: 30px; }
.s-track { flex: 1; height: 6px; background: #f5f7fa; border-radius: 10px; overflow: hidden; }
.s-fill { height: 100%; border-radius: 10px; }
.s-fill.hp { background: #56d9a1; }
.s-fill.atk { background: #ff9d55; }
.s-fill.def { background: #559ed0; }

.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0.3;
  font-weight: 700;
  font-size: 0.8rem;
  color: #7f8c8d;
}
.hint-dot { width: 4px; height: 4px; background: #7f8c8d; border-radius: 50%; }

.safari-actions {
  padding-bottom: 3rem;
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  align-items: center;
}
.action-btn-circle {
  width: 70px; height: 70px;
  border-radius: 50%;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  transition: all 0.3s;
}
.action-btn-circle:hover { transform: translateY(-5px); box-shadow: 0 20px 45px rgba(0,0,0,0.15); }
.action-btn-circle:active { transform: scale(0.9); }
.action-btn-circle.flee { color: #ff4757; }
.action-btn-circle.catch { 
  width: 85px; height: 85px; 
  background: white; 
  border: 4px solid #56d9a1;
  color: #56d9a1;
}

.pokeball-icon-small {
  width: 35px; height: 35px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff4757 50%, white 50%);
  border: 3px solid #2c3e50;
  position: relative;
}
.pokeball-icon-small::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 10px; height: 10px; background: white; border: 3px solid #2c3e50;
  border-radius: 50%;
}


@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes flyRight { to { transform: translateX(150vw) rotate(30deg); opacity: 0; } }
@keyframes flyLeft { to { transform: translateX(-150vw) rotate(-30deg); opacity: 0; } }

.fly-right { animation: flyRight 0.5s ease-in forwards; }
.fly-left { animation: flyLeft 0.5s ease-in forwards; }

.swipe-label {
  position: absolute;
  top: 3rem;
  font-size: 2.5rem;
  font-weight: 900;
  border: 6px solid currentColor;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  z-index: 10;
  pointer-events: none;
}
.swipe-label.catch { left: 2rem; color: #56d9a1; transform: rotate(-15deg); }
.swipe-label.flee { right: 2rem; color: #ff4757; transform: rotate(15deg); }


.safari-toast {
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 3rem;
  border-radius: 100px;
  color: white;
  font-weight: 800;
  font-size: 1.2rem;
  z-index: 1000;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}
.safari-toast.caught { background: #56d9a1; }
.safari-toast.missed { background: #34495e; }
.safari-toast.fled { background: #adb5bd; }

.pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse; }
@keyframes pop-in { from { opacity: 0; transform: translateX(-50%) scale(0.5); } }

.safari-empty { text-align: center; }
.empty-icon { font-size: 5rem; margin-bottom: 2rem; }
.safari-empty h2 { color: white; font-size: 2.5rem; font-weight: 900; margin-bottom: 1rem; }
.safari-empty p { color: rgba(255,255,255,0.7); font-size: 1.1rem; margin-bottom: 2rem; }

.btn-primary {
  display: inline-block;
  background: white;
  color: #2193b0;
  padding: 1rem 2rem;
  border-radius: 100px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.3s;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }

.load-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; color: white; }
.pokeball-loading {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(180deg, #ff4757 50%, white 50%);
  border: 4px solid #2c3e50;
  position: relative;
  animation: spin 1s infinite linear;
}
.pokeball-loading::after {
  content:''; position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 20px; height: 20px; background: white; border: 4px solid #2c3e50; border-radius: 50%;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .safari-header { padding: 1.5rem; }
  .safari-header h1 { font-size: 1.5rem; }
  .header-stats { gap: 0.5rem; }
  .stat-pill { min-width: 60px; padding: 0.4rem 0.75rem; }
}
</style>
