'use strict';

const Joi = require('joi');

module.exports = {
    method: 'patch',
    path: '/user/{id}',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('User ID')
            }),
            payload: Joi.object({
                firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
                lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
                username: Joi.string().min(3).example('johndoe').description('Username of the user'),
                mail: Joi.string().email().example('john.doe@example.com').description('Email of the user'),
                password: Joi.string().min(8).example('password123').description('Password (min 8 characters)'),
                scope: Joi.array().items(Joi.string().valid('user', 'admin')).description('Rôles de l\'utilisateur (admin uniquement)')
            }).min(1)
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();

        const user = await userService.update(request.params.id, request.payload);

        return user;
    }
};
