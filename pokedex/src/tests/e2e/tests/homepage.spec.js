import { test, expect } from '@playwright/test';

test('La page d\'accueil s\'affiche correctement', async ({ page }) => {
  // 1. Accéder à l'application Vue (ex: sur le port 5174 de Vite)
  await page.goto('http://localhost:5174/');

  // 2. L'application redirige vers /login pour les visiteurs non authentifiés
  // On s'attend donc à être sur la page de connexion
  await expect(page).toHaveURL(/.*\/login/);

  // 3. Vérifier que la page contient un élément de titre avec le texte "Connexion" ou "Bienvenue"
  const title = page.locator('h1.welcome-title');
  await expect(title).toContainText('Bienvenue !', { ignoreCase: true });
});
