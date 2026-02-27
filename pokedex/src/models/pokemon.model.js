const mongoose = require('mongoose');
const PkmnType = require('./PkmnType');

const pokemonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    types: {
        type: [{ 
            type: String, 
            enum: PkmnType
        }],
        required: true,
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length >= 1 && v.length <= 2;
            },
            message: 'Types doit contenir 1 ou 2 éléments.'
        }
    },
    description: { type: String },
    regions: [
        {
            regionName: { type: String, required: true },
            regionPokedexNumber: { type: Number, required: true }
        }
    ],
    imgUrl: { type: String },
    shinyImgUrl: { type: String },
    height: { type: String },
    weight: { type: String },
    category: { type: String },
    gender: {
        male: { type: Boolean },
        female: { type: Boolean }
    },
    abilities: [{ type: String }],
    weaknesses: [{ type: String }],
    stats: {
        hp: { type: Number },
        attack: { type: Number },
        defense: { type: Number },
        spAttack: { type: Number },
        spDefense: { type: Number },
        speed: { type: Number }
    },
    evolutions: [{
        pokemonId: { type: Number },
        name: { type: String }
    }]
});

const Pokemon = mongoose.model('Pokemon', pokemonSchema);

module.exports = Pokemon;