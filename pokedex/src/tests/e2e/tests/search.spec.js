import { test, expect } from '@playwright/test';

test('Rechercher un Pokémon affiche le bon résultat', async ({ page }) => {
  // 1. Ouvrir l'application
  await page.goto('/');

  // 2. Si non connecté, se connecter d'abord
  if (page.url().includes('/login')) {
    // Créer un utilisateur temporaire ou utiliser un compte de test existant
    // (A adapter avec tes vrais identifiants de dev ou d'une DB de test)
    await page.fill('input[type="text"]', 'Wyte'); // Remplace par un vrai identifiant
    await page.fill('input[type="password"]', 'test1234'); // Remplace par un vrai mdp
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
  }

  // 3. Localiser la barre de recherche (le placeholder exact dans ton code)
  const searchInput = page.getByPlaceholder('Rechercher un Pokémon…'); 

  // 4. L'utilisateur clique dessus et tape "Pikachu"
  await searchInput.fill('Pikachu');

  // 5. Appuyer sur "Entrée"
  await searchInput.press('Enter');

  // 6. Vérifier que le résultat s'affiche.
  // Dans ton composant, le nom est dans un h2 de classe .p-name
  const pokemonCardName = page.locator('.p-name').first();
  await expect(pokemonCardName).toHaveText('Pikachu', { ignoreCase: true });
});
