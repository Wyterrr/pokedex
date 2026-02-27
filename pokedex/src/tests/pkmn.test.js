const request = require('supertest');
const app = require('../../app');
const Pokemon = require('../models/pokemon.model');
const mongoose = require('mongoose');

// On s'assure que la connexion est établie AVANT de lancer les tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017');
  }
});

// On ferme la connexion une seule fois à la fin de tous les tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Pokemon API Routes public', () => {
  test('GET /api/pkmn should return a list of pokemon', async () => {
    const res = await request(app).get('/api/pkmn');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toMatchObject({
        name: expect.any(String),
        types: expect.arrayContaining([expect.any(String)]),
        description: expect.any(String),
        regions: expect.any(Array),
        imgUrl: expect.any(String),
        shinyImgUrl: expect.any(String),
        height: expect.any(String),
        weight: expect.any(String),
        category: expect.any(String),
        // On vérifie que les stats sont présentes et sont des nombres
        stats: expect.objectContaining({
          hp: expect.any(Number),
          attack: expect.any(Number),
          defense: expect.any(Number),
          spAttack: expect.any(Number),
          spDefense: expect.any(Number),
          speed: expect.any(Number)
        }),
        abilities: expect.any(Array),
        weaknesses: expect.any(Array)
      });

      // Si le pokemon a des régions, on vérifie leur structure interne
      if (res.body.data[0].regions.length > 0) {
        expect(res.body.data[0].regions[0]).toMatchObject({
          regionName: expect.any(String),
          regionPokedexNumber: expect.any(Number)
        });
      }
    }
  });

  test('GET /api/pkmn/search should return a list of pokemon about the search', async () => {
    // Utilisation de partialName comme défini dans ton service
    const res = await request(app).get('/api/pkmn/search?partialName=Pikachu');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    
    if (res.body.data.length > 0) {
      // 1. On vérifie la structure
      expect(res.body.data[0]).toMatchObject({
        name: expect.any(String),
        types: expect.arrayContaining([expect.any(String)])
      });
      // 2. On vérifie le CONTENU : le nom doit contenir "Pikachu"
      expect(res.body.data[0].name.toLowerCase()).toContain('pikachu');
    }
  });

  test('GET /api/pkmn/search?typeOne=FEU should return fire type pokemon', async () => {
    // On utilise la route de recherche avec le filtre typeOne
    const res = await request(app).get('/api/pkmn/search?typeOne=FEU');
    expect(res.statusCode).toEqual(200);
    
    if (res.body.data.length > 0) {
      const pokemon = res.body.data[0];
      // On vérifie que le type FEU est bien présent dans le tableau des types
      expect(pokemon.types).toContain('FEU');
    }
  });

  test('GET /api/pkmn/types should return the list of all available types', async () => {
    const res = await request(app).get('/api/pkmn/types');
    expect(res.statusCode).toEqual(200);
    // Ici, on attend un tableau de strings, pas des objets Pokemon
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toContain('FEU');
    expect(res.body.data).toContain('EAU');
  });
});

describe('Pokemon API Routes Auth (pas admin)', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // User de test
    const testUser = {
      username: 'test_user_' + Math.random().toString(36).substring(7),
      email: 'test_' + Math.random().toString(36).substring(7) + '@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    // Inscription
    await request(app)
      .post('/auth/register')
      .send(testUser);

    // Connexion pour récupérer le token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    token = loginRes.body.token;
    userId = loginRes.body.userId;
  });

  afterAll(async () => {
    // Suppression de l'utilisateur de test
    if (userId) {
      const User = require('../models/users.model');
      await User.findByIdAndDelete(userId);
    }
    // Supprimer le pokemon crée par le test
    const Pokemon = require('../models/pokemon.model');
    await Pokemon.findOneAndDelete({ name: 'Maxence' });

  });

  test('POST /api/pkmn should create a new pokemon', async () => {
    const res = await request(app)
      .post('/api/pkmn')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Maxence',
        types: ['FEU'],
        description: 'Maxence is a pokemon',
        regions: [
          {
            regionName: 'Kanto',
            regionPokedexNumber: 1
          }
        ],
        imgUrl: 'https://example.com/Maxence.png',
        shinyImgUrl: 'https://example.com/shiny_Maxence.png',
        height: '0.4m',
        weight: '6kg',
        category: 'Souris',
        gender: {
          male: true,
          female: true
        },
        abilities: ['Static'],
        weaknesses: ['EAU', 'SOL'],
        stats: {
          hp: 35,
          attack: 55,
          defense: 40,
          spAttack: 50,
          spDefense: 50,
          speed: 90
        },
        evolutions: [
          {
            pokemonId: 2,
            name: 'Raichu'
          }
        ]
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toMatchObject({
      name: 'Maxence',
      types: ['FEU'],
      description: 'Maxence is a pokemon',
      regions: [
        {
          regionName: 'Kanto',
          regionPokedexNumber: 1
        }
      ],
      imgUrl: 'https://example.com/Maxence.png',
      shinyImgUrl: 'https://example.com/shiny_Maxence.png',
      height: '0.4m',
      weight: '6kg',
      category: 'Souris',
      gender: {
        male: true,
        female: true
      },
      abilities: ['Static'],
      weaknesses: ['EAU', 'SOL'],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        spAttack: 50,
        spDefense: 50,
        speed: 90
      },
      evolutions: [
        {
          pokemonId: 2,
          name: 'Raichu'
        }
      ]
    });
  });

  test('POST /api/pkmn should return an error to the creation of a pokemon without a name', async () => {
    const res = await request(app)
      .post('/api/pkmn')
      .set('Authorization', `Bearer ${token}`)
      .send({
        types: ['FEU'],
        description: 'Maxence is a pokemon',
        regions: [
          {
            regionName: 'Kanto',
            regionPokedexNumber: 1
          }
        ],
        imgUrl: 'https://example.com/Maxence.png',
        shinyImgUrl: 'https://example.com/shiny_Maxence.png',
        height: '0.4m',
        weight: '6kg',
        category: 'Souris',
        gender: {
          male: true,
          female: true
        },
        abilities: ['Static'],
        weaknesses: ['EAU', 'SOL'],
        stats: {
          hp: 35,
          attack: 55,
          defense: 40,
          spAttack: 50,
          spDefense: 50,
          speed: 90
        },
        evolutions: [
          {
            pokemonId: 2,
            name: 'Raichu'
          }
        ]
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toBe('Pokemon validation failed: name: Path `name` is required.');
  });

  test('DELETE /api/pkmn try to delete a pokemon without being admin', async () => {
    const res = await request(app)
      .delete('/api/pkmn?id=69a16e7b10a4a2ee454681f7')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Accès refusé. Droits administrateur requis.');
  });

  test('PUT /api/pkmn try to update a pokemon without being admin', async () => {
    const res = await request(app)
      .put('/api/pkmn?id=69a16e7b10a4a2ee454681f7')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Accès refusé. Droits administrateur requis.');
  });

  test('POST /api/pkmn/region try to add a region to a pokemon without being admin', async () => {
    const res = await request(app)
      .post('/api/pkmn/region')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Accès refusé. Droits administrateur requis.');
  });

  test('DELETE /api/pkmn/region try to remove a region from a pokemon without being admin', async () => {
    const res = await request(app)
      .delete('/api/pkmn/region')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe('Accès refusé. Droits administrateur requis.');
  });
});

describe('Pokemon API Routes with Auth (admin)', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const User = require('../models/users.model');
    const testAdmin = {
      username: 'admin_' + Math.random().toString(36).substring(7),
      email: 'admin_' + Math.random().toString(36).substring(7) + '@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User'
    };

    await request(app)
      .post('/auth/register')
      .send(testAdmin);

    // On passe l'utilisateur en admin directement en base de données. 
    // Attention: le champ est 'role' et non 'isAdmin'
    await User.findOneAndUpdate({ email: testAdmin.email }, { role: 'admin' });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testAdmin.email,
        password: testAdmin.password
      });

    token = loginRes.body.token;
    userId = loginRes.body.userId;
  });


  afterAll(async () => {
    // Suppression de l'utilisateur de test
    if (userId) {
      const User = require('../models/users.model');
      await User.findByIdAndDelete(userId);
    }
    // Supprimer le pokemon crée par le test
    const Pokemon = require('../models/pokemon.model');
    await Pokemon.findOneAndDelete({ name: 'Maxence' });

  });

  test('GET /api/test-admin should return 200 if user is admin', async () => {
    const res = await request(app)
      .get('/api/test-admin')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('OK');
  });

  test('DELETE /api/pkmn should delete a pokemon', async () => {
    // 1. Création d'un pokemon de test
    const createRes = await request(app)
      .post('/api/pkmn')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'ABrûler',
        types: ['FEU'],
        description: 'Pokemon de test pour suppression',
        regions: [{ regionName: 'Kanto', regionPokedexNumber: 999 }],
        imgUrl: 'https://example.com/test.png',
        shinyImgUrl: 'https://example.com/shiny_test.png',
        height: '1m',
        weight: '10kg',
        category: 'Test',
        gender: { male: true, female: true },
        abilities: ['Test'],
        weaknesses: ['EAU'],
        stats: { hp: 10, attack: 10, defense: 10, spAttack: 10, spDefense: 10, speed: 10 },
        evolutions: []
      });
    
    expect(createRes.statusCode).toEqual(201);
    const pkmnId = createRes.body.data._id;

    // 2. Suppression du pokemon
    const res = await request(app)
      .delete(`/api/pkmn?id=${pkmnId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Pokemon deleted successfully');

    // 3. Vérification qu'il n'existe plus
    const checkRes = await request(app).get(`/api/pkmn?id=${pkmnId}`);
    expect(checkRes.statusCode).toEqual(404);
  });

  test('DELETE /api/pkmn/region should delete a region', async () => {
    // 1. Création d'un pokemon avec une région
    const createRes = await request(app)
      .post('/api/pkmn')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'RegionDeleteTest',
        types: ['FEU'],
        description: 'Test region delete',
        regions: [{ regionName: 'Johto', regionPokedexNumber: 155 }],
        imgUrl: 'https://test.com/img.png',
        shinyImgUrl: 'https://test.com/shiny.png',
        height: '1m',
        weight: '1kg',
        category: 'Test',
        gender: { male: true, female: true },
        abilities: ['Test'],
        weaknesses: ['EAU'],
        stats: { hp: 10, attack: 10, defense: 10, spAttack: 10, spDefense: 10, speed: 10 },
        evolutions: []
      });
    
    const pkmnId = createRes.body.data._id;

    // 2. Suppression de la région
    const res = await request(app)
      .delete('/api/pkmn/region')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pkmnId: pkmnId,
        regionName: 'Johto'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Région supprimée avec succès');

    // 3. Nettoyage
    await Pokemon.findByIdAndDelete(pkmnId);
  });
  
});

describe('Auth Routes', () => {
    let newUser;

    beforeAll(() => {
        newUser = {
            username: 'auth_user_' + Math.random().toString(36).substring(7),
            email: 'auth_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123',
            firstName: 'Auth',
            lastName: 'Tester'
        };
    });

    afterAll(async () => {
        const User = require('../models/users.model');
        if (newUser && newUser.email) {
            await User.findOneAndDelete({ email: newUser.email });
        }
    });

    test('POST /auth/register should create a new user', async () => {
    const res = await request(app)
        .post('/auth/register')
        .send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('Utilisateur créé avec succès');
    });

    test('POST /auth/login should return a token for valid credentials', async () => {
    const res = await request(app)
        .post('/auth/login')
        .send({
        email: newUser.email,
        password: newUser.password
        });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
    });

    test('POST /auth/login should return 401 for invalid credentials', async () => {
    const res = await request(app)
        .post('/auth/login')
        .send({
        email: newUser.email,
        password: 'wrongpassword'
        });

    expect(res.statusCode).toEqual(401);
    });
});

describe('Trainer Routes', () => {
    let newTrainer;

    beforeAll(() => {
        newTrainer = {
            username: 'trainer_user_' + Math.random().toString(36).substring(7),
            email: 'trainer_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123',
            firstName: 'Trainer',
            lastName: 'Tester'
        };
    });

    afterAll(async () => {
        const User = require('../models/users.model');
        if (newTrainer && newTrainer.email) {
            await User.findOneAndDelete({ email: newTrainer.email });
        }
    });

    test('POST /trainer/ should create a new trainer', async () => {
        await request(app).post('/auth/register').send(newTrainer);
        
        const loginRes = await request(app).post('/auth/login').send({
            email: newTrainer.email,
            password: newTrainer.password
        });
        const token = loginRes.body.token;

        const Trainer = require('../models/trainer.model');
        await Trainer.findOneAndDelete({ username: newTrainer.username });

        const res = await request(app)
            .post('/trainer/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                trainerName: 'Ash Ketchum',
                imgUrl: 'https://example.com/ash.png'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('data');
        expect(res.body.message).toBe('Dresseur créé avec succès');
    });

    test('POST /trainer/ should return 400 if trainer already exists', async () => {
        await request(app).post('/auth/register').send({
            username: 'duplicate_trainer_' + Math.random().toString(36).substring(7),
            email: 'duplicate_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123',
            firstName: 'Duplicate',
            lastName: 'Tester'
        });

        const loginRes = await request(app).post('/auth/login').send({
            email: expect.any(String), 
        });
        const tempUser = {
            username: 'dup_user_' + Math.random().toString(36).substring(7),
            email: 'dup_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(tempUser);
        const logRes = await request(app).post('/auth/login').send({
            email: tempUser.email,
            password: tempUser.password
        });
        const token = logRes.body.token;

        const res = await request(app)
            .post('/trainer/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                trainerName: 'Ash Ketchum'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Cet utilisateur possède déjà un dresseur.');
    });

    test('GET /trainer/ should return the trainer and 404 if not found', async () => {
        const user = {
            username: 'get_user_' + Math.random().toString(36).substring(7),
            email: 'get_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(user);
        const logRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = logRes.body.token;

        const res = await request(app)
            .get('/trainer/')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.username).toBe(user.username);

        const Trainer = require('../models/trainer.model');
        await Trainer.findOneAndDelete({ username: user.username });

        const resNotFound = await request(app)
            .get('/trainer/')
            .set('Authorization', `Bearer ${token}`);
        
        expect(resNotFound.statusCode).toEqual(404);
        expect(resNotFound.body.message).toBe('Aucun dresseur trouvé pour cet utilisateur');
    });

    test('PUT /trainer/ should update the trainer', async () => {
        const user = {
            username: 'put_user_' + Math.random().toString(36).substring(7),
            email: 'put_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(user);
        const logRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = logRes.body.token;

        const res = await request(app)
            .put('/trainer/')
            .set('Authorization', `Bearer ${token}`)
            .send({ trainerName: 'Updated Name' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.trainerName).toBe('Updated Name');
    });

    test('DELETE /trainer/ should delete the trainer', async () => {
        const user = {
            username: 'del_user_' + Math.random().toString(36).substring(7),
            email: 'del_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(user);
        const logRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = logRes.body.token;

        const res = await request(app)
            .delete('/trainer/')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(204);

        const resCheck = await request(app)
            .get('/trainer/')
            .set('Authorization', `Bearer ${token}`);
        expect(resCheck.statusCode).toEqual(404);
    });

    test('POST /trainer/mark should mark a pokemon as seen or caught', async () => {
        const user = {
            username: 'mark_user_' + Math.random().toString(36).substring(7),
            email: 'mark_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(user);
        const logRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = logRes.body.token;

        const pkmnRes = await request(app).get('/api/pkmn');
        if (pkmnRes.body.data.length === 0) {
            console.warn('Skipping mark test because no pokemon found in DB');
            return;
        }
        const pkmnId = pkmnRes.body.data[0]._id;

        const resCatch = await request(app)
            .post('/trainer/mark')
            .set('Authorization', `Bearer ${token}`)
            .send({ pokemonId: pkmnId, isCaptured: true });
        
        expect(resCatch.statusCode).toEqual(200);
        expect(resCatch.body.data.pkmnCatch).toContain(pkmnId);

        const resSeen = await request(app)
            .post('/trainer/mark')
            .set('Authorization', `Bearer ${token}`)
            .send({ pokemonId: pkmnId, isCaptured: false });
        
        expect(resSeen.statusCode).toEqual(200);
        expect(resSeen.body.data.pkmnSeen).toContain(pkmnId);
        expect(resSeen.body.data.pkmnCatch).not.toContain(pkmnId);
    });

    test('POST /trainer/mark should return 400 for invalid pokemonId', async () => {
        const user = {
            username: 'mark_err_user_' + Math.random().toString(36).substring(7),
            email: 'mark_err_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        await request(app).post('/auth/register').send(user);
        const logRes = await request(app).post('/auth/login').send({ email: user.email, password: user.password });
        const token = logRes.body.token;

        const res = await request(app)
            .post('/trainer/mark')
            .set('Authorization', `Bearer ${token}`)
            .send({ pokemonId: '69a16e7b10a4a2ee454681f7', isCaptured: true });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Pokémon non valide / inexistant');
    });
});

describe('User Routes', () => {
    let testUser;
    let otherUser;
    let token;
    let userId;
    let otherUserId;

    beforeAll(async () => {
        testUser = {
            username: 'user_suite_' + Math.random().toString(36).substring(7),
            email: 'user_suite_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123',
            firstName: 'User',
            lastName: 'Suite'
        };
        otherUser = {
            username: 'other_suite_' + Math.random().toString(36).substring(7),
            email: 'other_suite_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };

        await request(app).post('/auth/register').send(testUser);
        const logRes = await request(app).post('/auth/login').send({ email: testUser.email, password: testUser.password });
        token = logRes.body.token;
        userId = logRes.body.userId;

        await request(app).post('/auth/register').send(otherUser);
        const otherLogRes = await request(app).post('/auth/login').send({ email: otherUser.email, password: otherUser.password });
        otherUserId = otherLogRes.body.userId;
    });

    afterAll(async () => {
        const User = require('../models/users.model');
        await User.deleteMany({ username: { $regex: /_suite_/ } });
    });

    test('POST /users/ should create a new user', async () => {
        const res = await request(app)
            .post('/users/')
            .send({
                username: 'post_user_' + Math.random().toString(36).substring(7),
                email: 'post_' + Math.random().toString(36).substring(7) + '@test.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
    });

    test('POST /users/ should return 400 for invalid data', async () => {
        const res = await request(app)
            .post('/users/')
            .send({ username: 'sh' });
        expect(res.statusCode).toEqual(400);
    });

    test('GET /users/ should return all users', async () => {
        const res = await request(app).get('/users/');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /users/:id should return a specific user', async () => {
        const res = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toBe(userId);
    });

    test('GET /users/:id should return 403 if accessing another user', async () => {
        const res = await request(app)
            .get(`/users/${otherUserId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    test('GET /users/:id should return 404 if user not found', async () => {
        const res = await request(app)
            .get('/users/65dae3d82d5d6d3cbd3c3c4d')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    test('PUT /users/:id should update user data', async () => {
        const res = await request(app)
            .put(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'NewName', password: 'newpassword123' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.firstName).toBe('Newname');
    });

    test('PUT /users/:id should return 403 if updating another user', async () => {
        const res = await request(app)
            .put(`/users/${otherUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'Hacker' });
        expect(res.statusCode).toEqual(403);
    });

    test('DELETE /users/:id should delete user', async () => {
        const tempUser = {
            username: 'del_user_' + Math.random().toString(36).substring(7),
            email: 'del_' + Math.random().toString(36).substring(7) + '@test.com',
            password: 'password123'
        };
        const createRes = await request(app).post('/users/').send(tempUser);
        const res = await request(app).delete(`/users/${createRes.body.id}`);
        expect(res.statusCode).toEqual(200);
    });

    test('DELETE /users/:id should return 404 if user not found', async () => {
        const res = await request(app).delete('/users/65dae3d82d5d6d3cbd3c3c4d');
        expect(res.statusCode).toEqual(404);
    });
});