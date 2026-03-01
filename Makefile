PORT ?= 5174

.PHONY: install up dev down test test-api test-e2e clean seed

install:
	@echo "Installation des dépendances du Backend..."
	cd pokedex && npm install && npm install axios
	@echo "Installation des dépendances du Frontend..."
	cd pokedex-front && npm install
	@echo "Installation des dépendances pour les tests E2E..."
	cd pokedex/src/tests/e2e && npm install

up:
	@echo "Démarrage de MongoDB..."
	docker compose up -d

seed: up
	@echo "Peuplement de la base de données (Pokemon + Utilisateur Wyte)..."
	cd pokedex && node seed.js

down:
	@echo "Arrêt de MongoDB..."
	docker compose down

dev: up
	@echo "Démarrage du Backend et du Frontend en parallèle..."
	npx concurrently -k -p "[{name}]" -n "BACKEND,FRONTEND" -c "bgBlue.bold,bgGreen.bold" \
		"cd pokedex && npm run dev" \
		"cd pokedex-front && npm run dev"

test-api:
	@echo "Lancement des tests API (Backend)..."
	cd pokedex && npm test

test-e2e:
	@echo "Lancement des tests E2E (Frontend)..."
	cd pokedex/src/tests/e2e && PORT=$(PORT) npx playwright test

test: test-api test-e2e

clean: down
	@echo "Nettoyage des modules Node..."
	rm -rf pokedex/node_modules
	rm -rf pokedex-front/node_modules
	rm -rf pokedex/src/tests/e2e/node_modules
