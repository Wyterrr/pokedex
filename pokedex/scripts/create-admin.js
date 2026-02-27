const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/users.model');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017';

async function createAdmin() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        // Demander les informations de l'admin
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (prompt) => new Promise((resolve) => {
            readline.question(prompt, resolve);
        });

        console.log('\n=== Création d\'un utilisateur ADMIN ===\n');

        const username = await question('Username: ');
        const email = await question('Email: ');
        const password = await question('Password: ');
        const firstName = await question('Prénom (optionnel): ');
        const lastName = await question('Nom (optionnel): ');

        readline.close();

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            console.log('\n⚠️  Cet utilisateur existe déjà. Voulez-vous le mettre à jour en admin ?');
            
            const result = await User.updateOne(
                { username },
                { $set: { role: 'admin' } }
            );

            if (result.modifiedCount > 0) {
                console.log('Utilisateur mis à jour en ADMIN !');
            } else {
                console.log('L\'utilisateur est déjà admin.');
            }
        } else {
            // Créer un nouvel utilisateur admin
            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = new User({
                username,
                email,
                password: hashedPassword,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                role: 'admin'
            });

            await newAdmin.save();
            console.log('Nouvel utilisateur ADMIN créé avec succès !');
        }

        console.log('\n👤 Informations de l\'admin :');
        const admin = await User.findOne({ username }, { password: 0 });
        console.log(admin);

    } catch (error) {
        console.error('Erreur :', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Déconnecté de MongoDB');
        process.exit(0);
    }
}

createAdmin();
