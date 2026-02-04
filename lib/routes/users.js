'use strict';

module.exports = {
    method: 'get',
    path: '/users',
    options: {
        tags: ['api']
    },
    handler: async (request, h) => {
    
        const userService = request.services().userService;
        
        const users = await userService.list();

        return users;
    }
};
