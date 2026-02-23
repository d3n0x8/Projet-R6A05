'use strict';

const Joi = require('joi');

module.exports = {
    method: 'post',
    path: '/movie',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin']
        },
        validate: {
            payload: Joi.object({
                title: Joi.string().required().min(1).example('Inception').description('Titre du film'),
                description: Joi.string().required().example('Un thriller psychologique').description('Description du film'),
                releaseDate: Joi.date().required().example('2010-07-16').description('Date de sortie du film'),
                director: Joi.string().required().min(1).example('Christopher Nolan').description('Réalisateur du film')
            })
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        return await movieService.create(request.payload);
    }
};
