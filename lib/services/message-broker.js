'use strict';

const Amqplib = require('amqplib');
const { stringify } = require('csv-stringify/sync');
const { Service } = require('@hapipal/schmervice');

const QUEUE_NAME = 'csv-export';

module.exports = class MessageBrokerService extends Service {

    async connect() {

        if (!this._channel) {
            this._connection = await Amqplib.connect(process.env.AMQP_URL);
            this._channel = await this._connection.createChannel();
            await this._channel.assertQueue(QUEUE_NAME, { durable: true });
        }

        return this._channel;
    }

    async publish(data) {

        const channel = await this.connect();
        channel.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify(data)),
            { persistent: true }
        );
    }

    async startConsumer() {

        const channel = await this.connect();
        const server = this.server;

        channel.consume(QUEUE_NAME, async (msg) => {

            if (!msg) {
                return;
            }

            try {
                const { userEmail } = JSON.parse(msg.content.toString());
                const { movieService, mailService } = server.services();
                const movies = await movieService.list();

                const csvContent = this.generateCsv(movies);

                await mailService.send(
                    userEmail,
                    '📊 Export CSV — Bibliothèque de films',
                    '<p>Veuillez trouver en pièce jointe l\'export CSV de l\'ensemble des films.</p>',
                    [
                        {
                            filename: 'movies.csv',
                            content: csvContent,
                            contentType: 'text/csv'
                        }
                    ]
                );

                channel.ack(msg);
                console.log(`Export CSV envoyé à ${userEmail}`);
            }
            catch (err) {
                console.error('Erreur lors du traitement de l\'export CSV :', err.message);
                channel.nack(msg, false, false);
            }
        });

        console.log(`Message broker : écoute sur la queue "${QUEUE_NAME}"`);
    }

    generateCsv(movies) {

        return stringify(movies, {
            header: true,
            columns: ['id', 'title', 'description', 'releaseDate', 'director', 'createdAt', 'updatedAt']
        });
    }
};
