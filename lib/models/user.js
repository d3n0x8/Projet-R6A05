'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            username: Joi.string().min(3).example('johndoe').description('Username of the user'),
            mail: Joi.string().email().example('john.doe@example.com').description('Email of the user'),
            password: Joi.string().min(8).example('password123').description('Password of the user (min 8 characters)'),
            scope: Joi.array().items(Joi.string().valid('user', 'admin')).description('Roles/scopes de l\'utilisateur'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    static get jsonAttributes() {

        return ['scope'];
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;

        if (!this.scope) {
            this.scope = ['user'];
        }
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }

    $formatJson(json) {

        json = super.$formatJson(json);
        delete json.password;
        return json;
    }
};
