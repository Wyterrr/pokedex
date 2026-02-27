const mongoose = require('mongoose');
const axios = require('axios');
const Pokemon = require('./src/models/pokemon.model');

// URI pour la connexion avec mongoDB
const MONGO_URI = 'mongodb://admin:admin123@localhost:27017';

// Mapping des types en français
const typeMap = {
    normal: 'NORMAL',
    fire: 'FEU',
    water: 'EAU',
    grass: 'PLANTE',
    electric: 'ELECTRIK',
    ice: 'GLACE',
    fighting: 'COMBAT',
    poison: 'POISON',
    ground: 'SOL',
    flying: 'VOL',
    psychic: 'PSY',
    bug: 'INSECTE',
    rock: 'ROCHE',
    ghost: 'SPECTRE',
    dragon: 'DRAGON',
    dark: 'TENEBRES',
    steel: 'ACIER',
    fairy: 'FEE'
};

// Mapping des faiblesses pour ne pas avoir a chercher dans l'api (car c'est toujours les mêmes)
const weaknessMap = {
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    ground: ['water', 'grass', 'ice'],
    psychic: ['bug', 'ghost', 'dark'],
    normal: ['fighting'],
    fighting: ['flying', 'psychic', 'fairy'],
    flying: ['electric', 'ice', 'rock'],
    poison: ['ground', 'psychic'],
    bug: ['fire', 'flying', 'rock'],
    ghost: ['ghost', 'dark'],
    dark: ['fighting', 'bug', 'fairy'],
    dragon: ['ice', 'dragon', 'fairy'],
    steel: ['fire', 'fighting', 'ground'],
    fairy: ['poison', 'steel']
};

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        console.log('Wiping existing Pokemon collection...');
        await Pokemon.deleteMany({});
        console.log('Collection cleared.');

        console.log('Fetching first 151 Pokemon from PokeAPI...');
        // On utilise l'api pokeapi pour récupérer les données des pokemons
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=700');
        const results = response.data.results;
        
        console.log(`Formatage et téléchargement profond de ${results.length} Pokemon...`);
        const pokemonPromises = results.map(async (poke) => {
            // On récupère les données des pokemon (taille, poids, etc.)
            const details = await axios.get(poke.url);
            const data = details.data;

            // On récupère les données des pokemon (description, catégorie, etc.)
            const species = await axios.get(data.species.url);
            const speciesData = species.data;

            // Traduction des types
            const mappedTypes = data.types.map(t => typeMap[t.type.name]).filter(t => t);
            const primaryEnglishType = data.types[0].type.name;
            
            // Nom du pokemon
            const capitalizedName = poke.name.charAt(0).toUpperCase() + poke.name.slice(1);
            
            // Description
            let desc = 'Description non disponible.';
            const enEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
            if (enEntry) {
                desc = enEntry.flavor_text.replace(/[\n\f\r]/g, ' ');
            }

            // Catégorie
            let cat = 'Unknown';
            const genusObj = speciesData.genera.find(g => g.language.name === 'en');
            if (genusObj) cat = genusObj.genus.replace(' Pokémon', '');

            // Evolution
            let evoChain = [];
            try {
                if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
                    const evoRes = await axios.get(speciesData.evolution_chain.url);
                    
                    // Fonction récursive pour analyser la chaîne d'évolution
                    const extractEvolutions = (node) => {
                        if (!node || !node.species) return;
                        const urlParts = node.species.url.split('/');
                        const speciesId = parseInt(urlParts[urlParts.length - 2]);
                        
                        // On ne garde que les pokemons du nombre de limit choisis 
                        if (speciesId <= 700) {
                            const evoName = node.species.name.charAt(0).toUpperCase() + node.species.name.slice(1);
                            evoChain.push({ pokemonId: speciesId, name: evoName });
                        }
                        
                        if (node.evolves_to && node.evolves_to.length > 0) {
                            node.evolves_to.forEach(child => extractEvolutions(child));
                        }
                    };
                    
                    extractEvolutions(evoRes.data.chain);
                }
            } catch (err) {
                console.error(`Error mapping evolution chain for ${capitalizedName}`);
            }

            // On crée le json
            return {
                name: capitalizedName,
                types: mappedTypes.length > 0 ? mappedTypes : ['NORMAL'],
                imgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
                shinyImgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${data.id}.png`,
                description: desc,
                regions: [{ regionName: 'Kanto', regionPokedexNumber: data.id }],
                height: `${data.height / 10}m`,
                weight: `${data.weight / 10}kg`,
                category: cat,
                gender: {
                    male: speciesData.gender_rate !== -1 && speciesData.gender_rate < 8,
                    female: speciesData.gender_rate !== -1 && speciesData.gender_rate > 0
                },
                abilities: data.abilities.map(a => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)),
                weaknesses: weaknessMap[primaryEnglishType] || ['normal'],
                stats: {
                    hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
                    attack: data.stats.find(s => s.stat.name === 'attack').base_stat,
                    defense: data.stats.find(s => s.stat.name === 'defense').base_stat,
                    spAttack: data.stats.find(s => s.stat.name === 'special-attack').base_stat,
                    spDefense: data.stats.find(s => s.stat.name === 'special-defense').base_stat,
                    speed: data.stats.find(s => s.stat.name === 'speed').base_stat,
                },
                evolutions: evoChain
            };
        });

        // On attend que toutes les données soient récupérées
        const pokemonList = await Promise.all(pokemonPromises);
        
        console.log('Inserting heavy records into MongoDB...');
        await Pokemon.insertMany(pokemonList);
        
        console.log(`Successfully seeded ${pokemonList.length} deep data Pokemon!`);
        
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

seedDatabase();
