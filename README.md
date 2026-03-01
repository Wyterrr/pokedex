# MMI - Dev Avancé - 2026

Objectif : Réaliser une application Front + Back de pokédex. 

Techno backend : MongoDB + NodeJS Express.js
Techno frontend : Site web responsive avec Framework Vue.js

## Démarrer le projet de A à Z

Un fichier `Makefile` a été configuré à la racine pour vous faciliter la vie.

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 20.x ou supérieure recommandée)
- [Docker & Docker Compose](https://www.docker.com/) (pour faire tourner la base de données MongoDB)

### 2. Installation initiale
Pour installer les dépendances de tous les sous-projets (Back, Front, Tests E2E), lancez une fois :
```bash
make install
```

### 3. Lancer l'environnement de développement
Pour tout démarrer (la base de données via Docker, le Backend sur le port 3000, et le Frontend) en un seul terminal :
```bash
make dev
```
*Le backend sera relancé automatiquement à chaque modification grâce à nodemon, idem pour le front avec Vite.*

### 4. Lancer les tests
Pour lancer les tests du Backend (via Jest) ET les parcours de test End-to-End pour le Front (via Playwright) :
```bash
make test
```
*Vous pouvez également lancer uniquement un des deux avec `make test-api` ou `make test-e2e`.*

### 5. Éteindre le projet
Pour stopper tout les processus (arrêter `make dev` se fait via `Ctrl + C`), pensez ensuite à fermer le conteneur Docker de la Base de Données avec :
```bash
make down
```

---

## Pitch de l'application : 

Le projet devra présenter une application de type Pokédex. Celle-ci demandera une authentification obligatoire (donc création de compte). 
Chaque utilisateur pourra avoir un profil de dresseur associé. Il pourra alors marquer les Pokémons vus et/ou possédés. Comme dans l'animé, 
le Pokédex aura la possibilité de lire à voix haute la description du Pokémon en question.

## Contraintes qualité : 

- Tests unitaires/intégration pour le back (Jest)
- Au moins 2 parcours End-to-End pour le front (Playwright)

Infos : Il existe une version JAVA Spring Boot non mis à jour pour votre curiosité si l'envie vous prends.