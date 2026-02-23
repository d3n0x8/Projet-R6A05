'use strict';

module.exports = {
    method: 'get',
    path: '/movies',
    options: {
        tags: ['api'],
        auth: {
            scope: ['user', 'admin']
        }
    },
    handler: async (request, h) => {

        const { movieService } = request.services();

        return await movieService.list();
    }
};
