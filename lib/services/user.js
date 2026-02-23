'use strict';

const Bcrypt = require('bcrypt');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const { Service } = require('@hapipal/schmervice');

module.exports = class UserService extends Service {

    async list() {

        const { User } = this.server.models();
        return await User.query();
    }

    async create(userData) {

        const { User } = this.server.models();
        const { mailService } = this.server.services();

        const hashedPassword = await Bcrypt.hash(userData.password, 10);

        const user = await User.query().insertAndFetch({
            ...userData,
            password: hashedPassword
        });

        try {
            await mailService.send(
                user.mail,
                'Bienvenue sur IUT Project ! 🎉',
                `<h1>Bienvenue ${user.firstName} ${user.lastName} !</h1>
                <p>Votre compte a été créé avec succès.</p>
                <p>Votre nom d'utilisateur : <strong>${user.username}</strong></p>
                <p>Bonne utilisation de l'application !</p>`
            );
        }
        catch (err) {
            console.error('Échec de l\'envoi du mail de bienvenue :', err.message);
        }

        return user;
    }

    async update(id, userData) {

        const { User } = this.server.models();

        if (userData.password) {
            userData.password = await Bcrypt.hash(userData.password, 10);
        }

        const updatedUser = await User.query().patchAndFetchById(id, userData);

        if (!updatedUser) {
            throw Boom.notFound('User not found');
        }

        return updatedUser;
    }

    async delete(id) {

        const { User } = this.server.models();
        const deleted = await User.query().deleteById(id);

        if (!deleted) {
            throw Boom.notFound('User not found');
        }

        return deleted;
    }

    async authenticate(mail, password) {

        const { User } = this.server.models();

        const user = await User.query().findOne({ mail });

        if (!user) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const isValid = await Bcrypt.compare(password, user.password);

        if (!isValid) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.mail,
                scope: user.scope || ['user']
            },
            {
                key: process.env.JWT_SECRET || 'iut_secret_key',
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 heures
            }
        );

        return { token };
    }
};
