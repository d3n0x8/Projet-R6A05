'use strict';

// Load modules

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Jwt = require('@hapi/jwt');
const Server = require('../server');
const Package = require('../package.json');

const { describe, it, before, after } = exports.lab = Lab.script();
const { expect } = Code;

const generateToken = (id, scope) => {

    return Jwt.token.generate(
        {
            aud: 'urn:audience:iut',
            iss: 'urn:issuer:iut',
            id,
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            scope
        },
        {
            key: process.env.JWT_SECRET || 'iut_secret_key',
            algorithm: 'HS512'
        },
        { ttlSec: 14400 }
    );
};

describe('Deployment', () => {

    let server;

    before(async () => {

        server = await Server.deployment();
    });

    after(async () => {

        await server.stop();
    });

    it('registers the main plugin.', () => {

        expect(server.registrations[Package.name]).to.exist();
    });
});

describe('Users', () => {

    let server;
    let userId;
    let userToken;
    let adminToken;

    before(async () => {

        server = await Server.deployment();
    });

    after(async () => {

        await server.stop();
    });

    it('POST /user — crée un utilisateur avec succès', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/user',
            payload: {
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                mail: 'john.doe@test.com',
                password: 'password123'
            }
        });

        expect(res.statusCode).to.equal(200);

        const user = JSON.parse(res.payload);

        expect(user.id).to.exist();
        expect(user.password).to.not.exist();

        userId = user.id;
        userToken = generateToken(user.id, ['user']);
        adminToken = generateToken(user.id, ['user', 'admin']);
    });

    it('POST /user — retourne 400 si données invalides', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/user',
            payload: { firstName: 'Jo' }
        });

        expect(res.statusCode).to.equal(400);
    });

    it('POST /user/login — retourne un token JWT si identifiants valides', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                mail: 'john.doe@test.com',
                password: 'password123'
            }
        });

        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload).token).to.exist();
    });

    it('POST /user/login — retourne 401 si mauvais mot de passe', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                mail: 'john.doe@test.com',
                password: 'wrongpassword'
            }
        });

        expect(res.statusCode).to.equal(401);
    });

    it('POST /user/login — retourne 401 si mail inconnu', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/user/login',
            payload: {
                mail: 'unknown@test.com',
                password: 'password123'
            }
        });

        expect(res.statusCode).to.equal(401);
    });

    it('GET /users — retourne 401 sans token', async () => {

        const res = await server.inject({ method: 'GET', url: '/users' });

        expect(res.statusCode).to.equal(401);
    });

    it('GET /users — retourne la liste des utilisateurs avec un token valide', async () => {

        const res = await server.inject({
            method: 'GET',
            url: '/users',
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload)).to.be.an.array();
    });

    it('PATCH /user/{id} — retourne 403 sans scope admin', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: `/user/${userId}`,
            headers: { authorization: `Bearer ${userToken}` },
            payload: { firstName: 'Jane' }
        });

        expect(res.statusCode).to.equal(403);
    });

    it('PATCH /user/{id} — modifie un utilisateur avec scope admin', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: `/user/${userId}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { firstName: 'Jane' }
        });

        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload).firstName).to.equal('Jane');
    });

    it('PATCH /user/{id} — retourne 404 si utilisateur inexistant', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: '/user/9999',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { firstName: 'Ghost' }
        });

        expect(res.statusCode).to.equal(404);
    });

    it('DELETE /user/{id} — retourne 403 sans scope admin', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/user/${userId}`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(403);
    });

    it('DELETE /user/{id} — retourne 404 si utilisateur inexistant', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: '/user/9999',
            headers: { authorization: `Bearer ${adminToken}` }
        });

        expect(res.statusCode).to.equal(404);
    });

    it('DELETE /user/{id} — supprime un utilisateur avec scope admin', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/user/${userId}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });

        expect(res.statusCode).to.equal(204);
    });
});

describe('Movies', () => {

    let server;
    let userToken;
    let adminToken;
    let movieId;

    before(async () => {

        server = await Server.deployment();

        const res = await server.inject({
            method: 'POST',
            url: '/user',
            payload: {
                firstName: 'Movie',
                lastName: 'Tester',
                username: 'movietester',
                mail: 'movie.tester@test.com',
                password: 'password123'
            }
        });

        const user = JSON.parse(res.payload);

        userToken = generateToken(user.id, ['user']);
        adminToken = generateToken(user.id, ['user', 'admin']);
    });

    after(async () => {

        await server.stop();
    });

    it('POST /movie — retourne 401 sans token', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/movie',
            payload: {
                title: 'Inception',
                description: 'A thriller',
                releaseDate: '2010-07-16',
                director: 'Christopher Nolan'
            }
        });

        expect(res.statusCode).to.equal(401);
    });

    it('POST /movie — retourne 403 avec scope user', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/movie',
            headers: { authorization: `Bearer ${userToken}` },
            payload: {
                title: 'Inception',
                description: 'A thriller',
                releaseDate: '2010-07-16',
                director: 'Christopher Nolan'
            }
        });

        expect(res.statusCode).to.equal(403);
    });

    it('POST /movie — crée un film avec scope admin', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/movie',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                title: 'Inception',
                description: 'A mind-bending thriller',
                releaseDate: '2010-07-16',
                director: 'Christopher Nolan'
            }
        });

        expect(res.statusCode).to.equal(200);

        const movie = JSON.parse(res.payload);

        expect(movie.id).to.exist();
        movieId = movie.id;
    });

    it('POST /movie — retourne 400 si champs manquants', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/movie',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { title: 'Incomplete' }
        });

        expect(res.statusCode).to.equal(400);
    });

    it('GET /movies — retourne 401 sans token', async () => {

        const res = await server.inject({ method: 'GET', url: '/movies' });

        expect(res.statusCode).to.equal(401);
    });

    it('GET /movies — retourne la liste des films avec un token valide', async () => {

        const res = await server.inject({
            method: 'GET',
            url: '/movies',
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload)).to.be.an.array();
    });

    it('PATCH /movie/{id} — retourne 403 sans scope admin', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: `/movie/${movieId}`,
            headers: { authorization: `Bearer ${userToken}` },
            payload: { title: 'Nope' }
        });

        expect(res.statusCode).to.equal(403);
    });

    it('PATCH /movie/{id} — modifie un film avec scope admin', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: `/movie/${movieId}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { title: 'Inception Updated' }
        });

        expect(res.statusCode).to.equal(200);
        expect(JSON.parse(res.payload).title).to.equal('Inception Updated');
    });

    it('PATCH /movie/{id} — retourne 404 si film inexistant', async () => {

        const res = await server.inject({
            method: 'PATCH',
            url: '/movie/9999',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { title: 'Ghost' }
        });

        expect(res.statusCode).to.equal(404);
    });

    it('DELETE /movie/{id} — retourne 403 sans scope admin', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/movie/${movieId}`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(403);
    });

    it('DELETE /movie/{id} — retourne 404 si film inexistant', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: '/movie/9999',
            headers: { authorization: `Bearer ${adminToken}` }
        });

        expect(res.statusCode).to.equal(404);
    });

    it('DELETE /movie/{id} — supprime un film avec scope admin', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/movie/${movieId}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });

        expect(res.statusCode).to.equal(204);
    });
});

describe('Favorites', () => {

    let server;
    let userToken;
    let movieId;

    before(async () => {

        server = await Server.deployment();

        const userRes = await server.inject({
            method: 'POST',
            url: '/user',
            payload: {
                firstName: 'Fav',
                lastName: 'Tester',
                username: 'favtester',
                mail: 'fav.tester@test.com',
                password: 'password123'
            }
        });

        const user = JSON.parse(userRes.payload);
        const adminToken = generateToken(user.id, ['user', 'admin']);

        userToken = generateToken(user.id, ['user']);

        const movieRes = await server.inject({
            method: 'POST',
            url: '/movie',
            headers: { authorization: `Bearer ${adminToken}` },
            payload: {
                title: 'Fav Movie',
                description: 'A test movie',
                releaseDate: '2020-01-01',
                director: 'Test Director'
            }
        });

        movieId = JSON.parse(movieRes.payload).id;
    });

    after(async () => {

        await server.stop();
    });

    it('POST /movie/{id}/favorite — retourne 401 sans token', async () => {

        const res = await server.inject({
            method: 'POST',
            url: `/movie/${movieId}/favorite`
        });

        expect(res.statusCode).to.equal(401);
    });

    it('POST /movie/{id}/favorite — retourne 404 si film inexistant', async () => {

        const res = await server.inject({
            method: 'POST',
            url: '/movie/9999/favorite',
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(404);
    });

    it('POST /movie/{id}/favorite — ajoute un film en favoris', async () => {

        const res = await server.inject({
            method: 'POST',
            url: `/movie/${movieId}/favorite`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(200);
    });

    it('POST /movie/{id}/favorite — retourne 409 si déjà en favoris', async () => {

        const res = await server.inject({
            method: 'POST',
            url: `/movie/${movieId}/favorite`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(409);
    });

    it('DELETE /movie/{id}/favorite — retourne 401 sans token', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/movie/${movieId}/favorite`
        });

        expect(res.statusCode).to.equal(401);
    });

    it('DELETE /movie/{id}/favorite — retire un film des favoris', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/movie/${movieId}/favorite`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(200);
    });

    it('DELETE /movie/{id}/favorite — retourne 404 si film non en favoris', async () => {

        const res = await server.inject({
            method: 'DELETE',
            url: `/movie/${movieId}/favorite`,
            headers: { authorization: `Bearer ${userToken}` }
        });

        expect(res.statusCode).to.equal(404);
    });
});

