'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Movie extends Model {

    static get tableName() {

        return 'movie';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().min(1).example('Inception').description('Titre du film'),
            description: Joi.string().example('Un thriller psychologique').description('Description du film'),
            releaseDate: Joi.date().example('2010-07-16').description('Date de sortie du film'),
            director: Joi.string().min(1).example('Christopher Nolan').description('Réalisateur du film'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }
};
