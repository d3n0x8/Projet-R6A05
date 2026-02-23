'use strict';

const Joi = require('joi');

module.exports = {
    method: 'delete',
    path: '/movie/{id}/favorite',
    options: {
        tags: ['api'],
        auth: {
            scope: ['user', 'admin']
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('ID du film à retirer des favoris')
            })
        }
    },
    handler: async (request, h) => {

        const { favoriteService } = request.services();
        const userId = request.auth.credentials.id;

        return await favoriteService.remove(userId, request.params.id);
    }
};
