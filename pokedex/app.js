require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Middlewares de parsing
app.use(express.urlencoded({extended:true }));
app.use(express.json());

//connexion mongodb
const mongoose =require('mongoose');

mongoose.connect('mongodb://admin:admin123@localhost:27017')
.then(() =>console.log('Connexion à MongoDB réussie !'))
.catch((err) =>console.log(err));

// Import des routes
const apiRouter = require('./src/routes/api');
app.use('/api', apiRouter);

const userRouter = require('./src/routes/user')
app.use('/users', userRouter)

const authRouter = require('./src/routes/auth')
app.use('/auth', authRouter)

const trainerRouter = require('./src/routes/trainer');
app.use('/trainer', trainerRouter);

module.exports = app;
