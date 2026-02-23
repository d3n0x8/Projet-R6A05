'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.table('user', (table) => {

            table.json('scope');
        });
    },

    async down(knex) {

        await knex.schema.table('user', (table) => {

            table.dropColumn('scope');
        });
    }
};
