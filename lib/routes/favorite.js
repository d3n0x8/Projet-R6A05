'use strict';

const Joi = require('joi');

module.exports = {
    method: 'post',
    path: '/movie/{id}/favorite',
    options: {
        tags: ['api'],
        auth: {
            scope: ['user', 'admin']
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('ID du film à ajouter en favoris')
            })
        }
    },
    handler: async (request, h) => {

        const { favoriteService } = request.services();
        const userId = request.auth.credentials.id;

        return await favoriteService.add(userId, request.params.id);
    }
};
