const PkmnType = require('../models/PkmnType');
const PkmnModel = require('../models/pokemon.model');

class PkmnService {
    getTypes() {
        return [...PkmnType];
    }

    async getAllPokemons() {
        return await PkmnModel.find();
    }

    async getPokemon(id, name) {
        try {
            if (id) {
                return await PkmnModel.findById(id);
            }
            if (name) {
                return await PkmnModel.findOne({ name: new RegExp(`^${name}$`, 'i') });
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    async searchPokemons({ page, size, typeOne, typeTwo, partialName }) {
        const query = {};

        if (partialName) {
            query.name = { $regex: partialName, $options: 'i' };
        }

        const typesToMatch = [];
        if (typeOne) typesToMatch.push(typeOne.toUpperCase());
        if (typeTwo) typesToMatch.push(typeTwo.toUpperCase());

        if (typesToMatch.length > 0) {
            query.types = { $all: typesToMatch };
        }

        let dbQuery = PkmnModel.find(query);

        if (page && size) {
            const limit = parseInt(size, 10);
            const skip = (parseInt(page, 10) - 1) * limit;
            dbQuery = dbQuery.skip(skip).limit(limit);
        } else if (size) {
            dbQuery = dbQuery.limit(parseInt(size, 10));
        }

        const data = await dbQuery.exec();
        const count = await PkmnModel.countDocuments(query);

        return { data, count };
    }

    async createPokemon(pokemonData) {
        const existingPokemon = await PkmnModel.findOne({ name: pokemonData.name });
        if (existingPokemon) {
            throw new Error('Un Pokémon avec ce nom existe déjà');
        }
        return await PkmnModel.create(pokemonData);
    }

    async deletePokemon(id) {
        try {
            return await PkmnModel.findByIdAndDelete(id);
        } catch (error) {
            return null;
        }
    }

    async updatePokemon(id, updateData) {
        try {
            return await PkmnModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        } catch (error) {
            throw error;
        }
    }

    async addRegionToPokemon(pokemonId, regionName, regionPokedexNumber) {
        const pokemon = await PkmnModel.findById(pokemonId);
        if (!pokemon) {
            throw new Error('Pokémon non trouvé');
        }
        const existingRegionIndex = pokemon.regions.findIndex(
            r => r.regionName === regionName
        );

        if (existingRegionIndex !== -1) {
            pokemon.regions[existingRegionIndex].regionPokedexNumber = regionPokedexNumber;
        } else {
            pokemon.regions.push({
                regionName,
                regionPokedexNumber
            });
        }

        return await pokemon.save();
    }

    async removeRegionFromPokemon(pokemonId, regionName) {
        const pokemon = await PkmnModel.findById(pokemonId);
        if (!pokemon) {
            return null;
        }

        const exactRegionIndex = pokemon.regions.findIndex(
            r => r.regionName.toLowerCase() === regionName.toLowerCase()
        );

        if (exactRegionIndex === -1) {
            return pokemon;
        }

        pokemon.regions.splice(exactRegionIndex, 1);

        return await pokemon.save();
    }
}

module.exports = {
    pkmnService: new PkmnService()
};
