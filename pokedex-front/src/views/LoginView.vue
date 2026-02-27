<template>
  <div class="pokedex-container">
    <div class="pokedex-card">
      <div class="pokedex-split">
        <div class="pokedex-left">          
          <div class="welcome-container">
            <div class="logo-box">
              <div class="glass-pokeball">
                <div class="pokeball-top"></div>
                <div class="pokeball-bottom"></div>
                <div class="pokeball-center">
                  <div class="center-button"></div>
                </div>
              </div>
            </div>
            
            <h1 class="welcome-title">Bienvenue !</h1>
            <p class="welcome-subtitle">Prêt à reprendre ta collection de Pokémon ?</p>
          </div>
        </div>
        
        <div class="pokedex-right">
          <div class="login-form-container">
            <h2 class="form-title">Connexion</h2>
            
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="identifier">Email ou Utilisateur</label>
                <div class="input-wrapper">
                  <span class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    id="identifier" 
                    v-model="identifier" 
                    required 
                    placeholder="Saisissez votre identifiant"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <div class="input-wrapper">
                  <span class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input 
                    type="password" 
                    id="password" 
                    v-model="password" 
                    required 
                    placeholder="Saisissez votre mot de passe"
                  >
                </div>
              </div>
              
              <div v-if="error" class="error-msg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ error }}
              </div>
              
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="!loading">Se connecter</span>
                <div v-else class="btn-spinner"></div>
              </button>
            </form>
            
            <p class="auth-link">
              Pas encore de compte ? 
              <router-link to="/register">S'inscrire</router-link>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const identifier = ref('');
const password = ref('');
const error = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  error.value = null;
  loading.value = true;
  try {
    await authStore.login(identifier.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de connexion';
  } finally {
    loading.value = false;
  }
};
</script>

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
  grid-template-columns: 1fr 1.2fr;
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
  justify-content: center;
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
  transition: all 0.2s ease;
}

.back-link:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(-3px);
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--c-white);
  padding-top: 2rem;
  margin-bottom: auto;
}

.logo-box {
  margin-bottom: 2.5rem;
}

.glass-pokeball {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  animation: float 4s ease-in-out infinite;
}

.pokeball-top {
  height: 50%;
  background: rgba(255, 255, 255, 0.2);
  border-bottom: 3px solid rgba(255, 255, 255, 0.8);
}

.pokeball-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid rgba(255, 255, 255, 1);
  border-radius: 50%;
  z-index: 2;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.center-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 300px;
}

.login-form-container {
  padding: 0 2rem;
}

.form-title {
  color: var(--c-white);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  color: var(--c-white);
  font-size: 0.9rem;
  font-weight: 600;
  padding-left: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  width: 20px;
  height: 20px;
}

.input-wrapper input {
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.submit-btn {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  color: var(--type-water);
  border-radius: 18px;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  background: rgba(255, 255, 255, 0.95);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.error-msg {
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #ffcad1;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-msg svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.auth-link {
  margin-top: 2rem;
  text-align: center;
  color: var(--c-white);
  font-size: 0.95rem;
  opacity: 0.8;
}

.auth-link a {
  font-weight: 700;
  text-decoration: underline;
  margin-left: 0.4rem;
  transition: opacity 0.2s;
}

.auth-link a:hover {
  opacity: 1;
}

.btn-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(33, 147, 176, 0.1);
  border-left-color: var(--type-water);
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
}

@keyframes btn-spin {
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-15px) rotate(5deg); }
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
  .welcome-container {
    padding-top: 0;
  }
  .glass-pokeball {
    width: 100px;
    height: 100px;
  }
  .welcome-title {
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
  
  .login-form-container {
    padding: 0;
  }
}
</style>
