<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { trainerService } from '../services/trainerService';
import ProfileTabs from '../components/ProfileTabs.vue';

const router = useRouter();
const authStore = useAuthStore();
const trainer = ref(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const data = await trainerService.getTrainerProfile();
        trainer.value = data;
    } catch (error) {
        console.error("Pas de compte dresseur trouvé ou erreur", error);
    } finally {
        loading.value = false;
    }
});

</script>

<template>
  <div class="pokedex-container">
    <div v-if="loading" class="loading">Chargement du profil...</div>
    <div v-else-if="!trainer" class="empty">Aucun profil dresseur trouvé pour ce compte.</div>
    <div v-else class="pokedex-card">
      <div class="pokedex-split">
        
        <div class="pokedex-left">
          
          <div class="profile-info-container">
            <div class="avatar-container">
              <img v-if="trainer.imgUrl" :src="trainer.imgUrl" alt="Avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                  </svg>
              </div>
            </div>
            
            <h1 class="trainer-name">{{ trainer.trainerName }}</h1>
            <p class="username">@{{ trainer.username }}</p>
            <p class="creation-date">Membre depuis le {{ new Date(trainer.creationDate).toLocaleDateString('fr-FR') }}</p>
            
            <div class="quick-stats">
              <div class="stat-bubble">
                <span class="stat-number">{{ trainer.pkmnSeen?.length || 0 }}</span>
                <span class="stat-label">Vus</span>
              </div>
              <div class="stat-bubble highlight">
                <span class="stat-number">{{ trainer.pkmnCatch?.length || 0 }}</span>
                <span class="stat-label">Capturés</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="pokedex-right">
          <ProfileTabs :trainer="trainer" />
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
  
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);
  
  border-radius: 40px;
  padding: 4rem;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.pokedex-split {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 5rem;
  flex: 1;
  min-height: 0;
}

.pokedex-left {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding-right: 3rem;
}

.pokedex-right {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.back-link {
  color: var(--c-white);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  align-self: flex-start;
  text-decoration: none;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-link:hover {
  background: rgba(255,255,255,0.3);
}

.profile-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--c-white);
  padding-top: 2rem;
}

.avatar-container {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255,255,255,0.2);
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.avatar-placeholder svg {
  width: 80px;
  height: 80px;
}

.trainer-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.username {
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0.9;
  margin: 0 0 1rem 0;
}

.creation-date {
  font-size: 1rem;
  opacity: 0.7;
  margin: 0;
}

.quick-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.stat-bubble {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 1.5rem;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.stat-bubble.highlight {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.loading, .empty {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@media (max-width: 1024px) {
  .pokedex-split {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .pokedex-left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-right: 0;
    padding-bottom: 2rem;
  }
  .pokedex-card {
    padding: 2rem;
    height: 95vh;
  }
  .profile-info-container {
    padding-top: 0;
  }
  .avatar-container {
    width: 120px;
    height: 120px;
    margin-bottom: 1rem;
  }
  .trainer-name {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .pokedex-container {
    padding: 0;
  }
  
  .pokedex-card {
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .quick-stats {
    gap: 1rem;
  }
  
  .stat-bubble {
    padding: 0.8rem 1rem;
    min-width: 80px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
