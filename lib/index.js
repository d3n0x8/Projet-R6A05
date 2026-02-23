'use strict';

const HauteCouture = require('@hapipal/haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    register: async (server, options) => {

        // Custom plugin code can go here

        await HauteCouture.compose(server, options);

        server.ext('onPreStart', async () => {

            const { messageBrokerService } = server.services();

            try {
                await messageBrokerService.startConsumer();
            }
            catch (err) {
                console.warn('Message broker non disponible :', err.message);
                console.warn('La fonctionnalité d\'export CSV ne sera pas disponible.');
            }
        });
    }
};
