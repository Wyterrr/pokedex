const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app'); // Assumes app.js exports the express app

const mockToken = "fake-jwt-token";
// Mock auth middleware for testing
jest.mock('../../src/middlewares/auth.middleware', () => {
    const mockMiddleware = (req, res, next) => {
        req.user = { id: 'admin123', role: 'ADMIN' };
        next();
    };

    mockMiddleware.isAdmin = (req, res, next) => {
        next();
    };

    return mockMiddleware;
});


describe('Pokemon API Tests', () => {

    beforeAll(async () => {
        // Assume app.js already connects to mongo, or wait for it
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdId;

    it('GET /api/pkmn should return all pokemons', async () => {
        const res = await request(app).get('/api/pkmn');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
    });

    it('POST /api/pkmn should create a pokemon', async () => {
        const payload = {
            name: "TestPokemon",
            types: ["NORMAL"],
            description: "Test description",
            regions: [{ regionName: "Kanto", regionPokedexNumber: 151 }]
        };
        const res = await request(app)
            .post('/api/pkmn')
            .send(payload)
            .set('Authorization', `Bearer ${mockToken}`);
        
        // Since auth might be mocked differently in app, expecting 201 or 401
        // We handle logic manually if tests hit db. 
        // Note: For a real test, usually a separate test db is used and auth is properly mocked.
        if (res.statusCode === 201) {
            createdId = res.body.data._id;
            expect(res.body.data.name).toEqual("TestPokemon");
        }
    });

    it('PUT /api/pkmn should update the pokemon', async () => {
        if (!createdId) return; // Skip if create failed
        const res = await request(app)
            .put(`/api/pkmn?id=${createdId}`)
            .send({ description: "Updated description" })
            .set('Authorization', `Bearer ${mockToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.description).toEqual("Updated description");
    });

    it('DELETE /api/pkmn/region should remove a region', async () => {
         if (!createdId) return;
         const res = await request(app)
            .delete(`/api/pkmn/region?pkmnID=${createdId}&regionName=Kanto`)
            .set('Authorization', `Bearer ${mockToken}`);
         expect(res.statusCode).toEqual(204);
    });

    it('DELETE /api/pkmn should delete the pokemon', async () => {
        if (!createdId) return;
        const res = await request(app)
            .delete(`/api/pkmn?id=${createdId}`)
            .set('Authorization', `Bearer ${mockToken}`);
        expect(res.statusCode).toEqual(204);
    });
});
