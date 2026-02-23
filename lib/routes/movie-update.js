'use strict';

const Joi = require('joi');

module.exports = {
    method: 'patch',
    path: '/movie/{id}',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('ID du film')
            }),
            payload: Joi.object({
                title: Joi.string().min(1).example('Inception').description('Titre du film'),
                description: Joi.string().example('Un thriller psychologique').description('Description du film'),
                releaseDate: Joi.date().example('2010-07-16').description('Date de sortie du film'),
                director: Joi.string().min(1).example('Christopher Nolan').description('Réalisateur du film')
            }).min(1)
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        return await movieService.update(request.params.id, request.payload);
    }
};
