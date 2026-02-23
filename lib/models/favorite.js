'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Favorite extends Model {

    static get tableName() {

        return 'favorite';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            userId: Joi.number().integer().greater(0).required(),
            movieId: Joi.number().integer().greater(0).required(),
            createdAt: Joi.date()
        });
    }

    static get relationMappings() {

        const User = require('./user');
        const Movie = require('./movie');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'favorite.userId',
                    to: 'user.id'
                }
            },
            movie: {
                relation: Model.BelongsToOneRelation,
                modelClass: Movie,
                join: {
                    from: 'favorite.movieId',
                    to: 'movie.id'
                }
            }
        };
    }

    $beforeInsert(queryContext) {

        this.createdAt = new Date();
    }
};
