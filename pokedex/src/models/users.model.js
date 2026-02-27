const mongoose = require('mongoose');

let validateEmail = function(email) {
    // expression régulière
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, minlength: 3, maxlength: 30 },
    firstName: String, 
    lastName: String,
    email: { type: String, unique: true, required: true , validate: [validateEmail, 'Please fill a valid email address']},
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});



// Middleware pour formater les noms avant la sauvegarde
userSchema.pre('save', async function() {
    if (this.firstName) {
        this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
    }
    if (this.lastName) {
        this.lastName = this.lastName.toUpperCase();
    }
});

// Middleware pour formater les noms lors des mises à jour
userSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    
    if (update.firstName) {
        update.firstName = update.firstName.charAt(0).toUpperCase() + update.firstName.slice(1).toLowerCase();
    }
    if (update.lastName) {
        update.lastName = update.lastName.toUpperCase();
    }
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;