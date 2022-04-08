'use strict';

import { expect } from 'chai';
import FilmModel from './models/FilmModel';
import UserModel from './models/UserModel';
import FilmCollection from './collections/FilmCollection';
import {
    ActiveRecord,
    Collection,
    Model,
} from '../src/index';

/**
 * Specific Model Tests
 */
describe('Specific Model Tests', () => {

    it('should hydrate with attributes', () => {
        const model: FilmModel = new FilmModel({
            foo: 'bar',
            x: 5,
        });

        // Get attribute
        const resultA: string = <string> model.attr('foo');
        const resultB: number = <number> model.attr('x');

        expect(resultA).to.equal('bar');
        expect(resultB).to.equal(5);
    });

    it('should hasMany', () =>
    {
        const model: FilmModel = new FilmModel({
            id: 5,
            foo: 'bar',
            x: 5,
            user: [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ],
            firstUser: new UserModel({
                id: 10,
                name: 'bob',
            }),
        });

        expect(model.firstUser.b.getUrl()).to.contain('film/5/user');
    });

    it('should use modified endpoint before', () =>
    {
        const model: FilmModel = new FilmModel({
            id: 5,
        });

        const modifiedEndpoint = new UserModel({
            id: 100
        });

        const endpoint: string = model.useModifiedEndpoint(modifiedEndpoint).b.getUrl();

        expect(endpoint).to.contain('user/100/film/5');
    });

    it('should use modified endpoint after', () =>
    {
        const model: FilmModel = new FilmModel({
            id: 5,
        });

        const modifiedEndpoint = new UserModel({
            id: 100
        });

        const endpoint: string = model.useModifiedEndpoint(modifiedEndpoint, 'after').b.getUrl();

        expect(endpoint).to.contain('film/5/user/100');
    });

    it('should use modified endpoint after without id', () =>
    {
        const model: FilmModel = new FilmModel({
            id: 5,
        });
        const modifiedEndpoint = new UserModel();
        const endpoint: string = model.useModifiedEndpoint(modifiedEndpoint, 'after').b.getUrl();

        expect(endpoint).to.contain('film/5/user');
    });

    it('should use relationship endpoint for user', () =>
    {
        const model: FilmModel = new FilmModel({
            id: 15,
            user: new UserModel({
                name: 'matt'
            }),
        });

        const endpoint: string = model.user.b.getUrl();

        expect(endpoint).to.contain('film/15/user');
    });

});
