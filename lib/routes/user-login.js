'use strict';

const Joi = require('joi');

module.exports = {
    method: 'post',
    path: '/user/login',
    options: {
        auth: false,
        tags: ['api'],
        validate: {
            payload: Joi.object({
                mail: Joi.string().email().required().example('john.doe@example.com').description('Email of the user'),
                password: Joi.string().required().example('password123').description('Password of the user')
            })
        }
    },
    handler: async (request, h) => {

        const { userService } = request.services();

        return await userService.authenticate(request.payload.mail, request.payload.password);
    }
};
