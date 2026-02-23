'use strict';

const Joi = require('joi');

module.exports = {
    method: 'delete',
    path: '/movie/{id}',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('ID du film')
            })
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        await movieService.delete(request.params.id);

        return '';
    }
};
