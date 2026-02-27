const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    trainerName: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    pkmnSeen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }],
    pkmnCatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }]
});

const Trainer = mongoose.model('Trainer', trainerSchema);

module.exports = Trainer;
