'use strict';

const Boom = require('@hapi/boom');
const { Service } = require('@hapipal/schmervice');

module.exports = class MovieService extends Service {

    async list() {

        const { Movie } = this.server.models();
        return await Movie.query();
    }

    async create(movieData) {

        const { Movie } = this.server.models();
        const { userService, mailService } = this.server.services();

        const movie = await Movie.query().insertAndFetch(movieData);

        try {
            const users = await userService.list();
            await Promise.all(
                users.map((user) => {

                    return mailService.send(
                        user.mail,
                        `🎦 Nouveau film disponible : ${movie.title}`,
                        `<h1>🎦 Nouveau film disponible !</h1><p>Le film <strong>${movie.title}</strong> vient d'être ajouté à la bibliothèque.</p><ul><li>Réalisateur : ${movie.director}</li><li>Description : ${movie.description}</li></ul>`
                    );
                })
            );
        }
        catch (err) {
            console.error('Échec de l\'envoi des notifications nouveau film :', err.message);
        }

        return movie;
    }

    async update(id, movieData) {

        const { Movie, Favorite } = this.server.models();
        const { mailService } = this.server.services();

        const movie = await Movie.query().patchAndFetchById(id, movieData);

        if (!movie) {
            throw Boom.notFound('Film introuvable');
        }

        try {
            const favorites = await Favorite.query()
                .where({ movieId: id })
                .withGraphFetched('user');

            await Promise.all(
                favorites.map((fav) => {

                    return mailService.send(
                        fav.user.mail,
                        `🎦 Mise à jour : ${movie.title}`,
                        `<h1>🎦 Un film de vos favoris a été mis à jour</h1><p>Le film <strong>${movie.title}</strong> que vous avez en favoris vient d'être mis à jour.</p><ul><li>Réalisateur : ${movie.director}</li><li>Description : ${movie.description}</li></ul>`
                    );
                })
            );
        }
        catch (err) {
            console.error('Échec de l\'envoi des notifications mise à jour film :', err.message);
        }

        return movie;
    }

    async delete(id) {

        const { Movie } = this.server.models();
        const deleted = await Movie.query().deleteById(id);

        if (!deleted) {
            throw Boom.notFound('Film introuvable');
        }

        return deleted;
    }
};
