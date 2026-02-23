'use strict';

module.exports = {
    method: 'post',
    path: '/export/movies',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin']
        }
    },
    handler: async (request, h) => {

        const { messageBrokerService } = request.services();
        const { email, id } = request.auth.credentials;

        await messageBrokerService.publish({ userEmail: email, userId: id });

        return h.response({
            message: 'Export en cours. Vous recevrez le fichier CSV par mail dans quelques instants.'
        }).code(202);
    }
};
