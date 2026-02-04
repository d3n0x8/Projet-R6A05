'use strict';

const Joi = require('joi');

module.exports = {
    method: 'delete',
    path: '/user/{id}',
    options: {
        tags: ['api'],
        validate: {
            params: Joi.object({
                id: Joi.number().integer().positive().required().description('User ID')
            })
        }
    },
    handler: async (request, h) => {
    
        const userService = request.services().userService;
        
        await userService.delete(request.params.id);

        return '';
    }
};
