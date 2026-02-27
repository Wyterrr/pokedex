<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const isActive = (path) => route.path === path;
</script>

<template>
  <div class="app-layout">
    <!-- Professionnel Sidebar Navigation -->
    <aside class="sidebar" v-if="authStore.isAuthenticated">
      <div class="sidebar-header">
        <div class="logo">
          <div class="pokeball-icon"></div>
          <span class="logo-text">PokéApp</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Pokédex</span>
        </router-link>

        <router-link to="/safari" class="nav-item" :class="{ active: isActive('/safari') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span>PokéSwipe</span>
        </router-link>

        <router-link to="/profile" class="nav-item" :class="{ active: isActive('/profile') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Mon profil</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="nav-item logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Handle Guest State (Login/Register) -->
    <aside class="sidebar guest-sidebar" v-else-if="route.path !== '/login' && route.path !== '/register'">
      <div class="sidebar-header">
        <div class="logo">
          <div class="pokeball-icon"></div>
          <span class="logo-text">PokéApp</span>
        </div>
      </div>
      <div class="sidebar-footer">
        <router-link to="/login" class="nav-item login-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>Connexion</span>
        </router-link>
      </div>
    </aside>

    <!-- Main View -->
    <main class="main-content" :class="{ 'with-sidebar': authStore.isAuthenticated || (route.path !== '/login' && route.path !== '/register') }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  padding: 2.5rem 1.5rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.sidebar-header {
  margin-bottom: 3.5rem;
  padding-left: 0.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
}

/* Nav Items */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.nav-item svg {
  width: 22px;
  height: 22px;
  stroke-width: 2.2px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(5px);
}

.nav-item.active {
  background: white;
  color: #2193b0; /* Match search/buttons color */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Footer Section */
.sidebar-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  background: rgba(255, 71, 87, 0.1);
  cursor: pointer;
  border: 1px solid #ff4757;
  color: #ff4757;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 0.2);
  transform: translateY(-2px);
}

.login-btn {
  color: #56d9a1;
  border: 1px solid rgba(86, 217, 161, 0.3);
}

.login-btn:hover {
  background: rgba(86, 217, 161, 0.1);
  border-color: #56d9a1;
  color: #56d9a1;
}

/* Main Content Area */
.main-content {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  transition: padding 0.3s ease;
}

/* Global Pokeball Icon adjustment for sidebar */
.pokeball-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #ff4757 50%, white 50%);
  border: 2.5px solid white;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.pokeball-icon::after {
  content: '';
  position: absolute;
  top: calc(50% - 1px);
  left: 0;
  width: 100%;
  height: 2px;
  background: white;
}

.pokeball-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: white;
  border: 2.5px solid #ff4757;
  border-radius: 50%;
  z-index: 1;
}

/* Mobile Responsive: Bottom Navigation Bar */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70px;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 0 1rem;
    background: rgba(255, 255, 255, 0.95); /* High opacity for readability */
    backdrop-filter: blur(20px);
    border-right: none;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 2000;
    box-shadow: 0 -10px 30px rgba(0,0,0,0.08); /* Stronger shadow to pop out */
  }

  .sidebar-header, .sidebar-footer {
    display: none;
  }

  /* Guest sidebar login button */
  .guest-sidebar {
    justify-content: center;
  }
  .guest-sidebar .sidebar-footer {
    display: flex;
    padding: 0;
    border: none;
    width: 100%;
    justify-content: center;
  }

  .sidebar-nav {
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    align-items: center;
    gap: 0;
  }

  .nav-item {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.3rem;
    border-radius: 12px;
    flex: 1;
    justify-content: center;
    border: none;
    color: #7f8c8d; /* CRITICAL FIX: Dark text/icons on white background */
  }

  .nav-item span {
    font-size: 0.65rem;
    font-weight: 700;
    display: block;
  }

  .nav-item svg {
    width: 26px; /* Slightly larger for thumb targets */
    height: 26px;
  }

  .nav-item:hover {
    transform: none; /* Disable hover translation on mobile */
    background: transparent;
  }

  .nav-item.active {
    background: transparent;
    color: #2193b0;
    box-shadow: none;
  }
  
  /* Add an indicator dot or line for active state instead of background box */
  .nav-item.active svg {
    filter: drop-shadow(0 4px 6px rgba(33, 147, 176, 0.3));
  }

  .main-content {
    height: calc(100vh - 70px); /* Leave space for bottom nav */
    padding-bottom: 20px; /* Extra breathing room at the bottom of lists */
  }
}

/* Tablet intermediary (optional but good for iPad portrait) */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 80px;
    padding: 2.5rem 0.75rem;
    align-items: center;
  }
  .logo-text, .nav-item span {
    display: none;
  }
  .nav-item {
    padding: 1rem;
    justify-content: center;
  }
  .sidebar-nav { gap: 1rem; }
}
</style>
