'use strict';

const Boom = require('@hapi/boom');
const { Service } = require('@hapipal/schmervice');

module.exports = class FavoriteService extends Service {

    async add(userId, movieId) {

        const { Favorite, Movie } = this.server.models();

        const movie = await Movie.query().findById(movieId);

        if (!movie) {
            throw Boom.notFound('Film introuvable');
        }

        const existing = await Favorite.query().findOne({ userId, movieId });

        if (existing) {
            throw Boom.conflict('Ce film est déjà dans vos favoris');
        }

        return await Favorite.query().insertAndFetch({ userId, movieId });
    }

    async remove(userId, movieId) {

        const { Favorite } = this.server.models();

        const favorite = await Favorite.query().findOne({ userId, movieId });

        if (!favorite) {
            throw Boom.notFound('Ce film n\'est pas dans vos favoris');
        }

        await Favorite.query().deleteById(favorite.id);
        return { message: 'Film supprimé des favoris avec succès' };
    }
};
