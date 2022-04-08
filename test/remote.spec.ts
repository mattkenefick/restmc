// 'use strict';

/**
 * @Todo we're using the shortoftheweek.app domain for requests, but
 * we shouldn't. We should have something mocked or local.
 */

import axios from 'axios';
import { expect } from 'chai';
import UserModel from './models/UserModel';
import FilmModel from './models/FilmModel';
import FilmCollection from './collections/FilmCollection';
import { ActiveRecord, Collection, Model, Request as EloquentRequest } from '../src/index';

// -----------------------------------------------------------------------------

const items: any = new FilmCollection([
	new FilmModel({
		id: 1,
		name: 'Ashley',
		x: 1,
	}),
	new FilmModel({
		id: 2,
		name: 'Briana',
		x: 2,
	}),
	new FilmModel({
		id: 3,
		name: 'Charlotte',
		x: 3,
	}),
	new FilmModel({
		id: 4,
		name: 'Danielle',
		x: 4,
	}),
	new FilmModel({
		id: 5,
		name: 'Elizabeth',
		x: 5,
	}),
	new FilmModel({
		id: 6,
		name: 'Fallon',
		x: 6,
	}),
]);

const options = {
	meta: {
		pagination: {
			count: 15,
			current_page: 1,
			per_page: 15,
			total: 1938,
			total_pages: 130,
		},
	},
};

// -----------------------------------------------------------------------------

/**
 * Remote Collection Tests
 */
describe('Remote Collection Tests', () => {
	// it('should url', () => {
	//     const collection: FilmCollection = FilmCollection.hydrate(items, options);
	//     const model: FilmModel = collection.at(0);

	//     // Get attribute
	//     // model.save();
	// });

	it('should delete', () => {
		// items[0].delete();
		// items.delete({ id: 1 });
		// Get attribute
		// model.save();
	});

	// it('should receive error', () => {
	//     var model = new FilmModel(null, {
	//         baseUrl: 'http://localhost:3333',
	//         endpoint: 'auth/basic/login',
	//     });

	//     model.post({
	//         email: 'john@example.com',
	//         password: 'supsupsup',
	//     });
	// });

	it('should fetch', () => {
		let collection = new FilmCollection({
			baseUrl: 'http://localhost:8000/api/v1',
			qp: { limit: 1 },
		});

		let model = new UserModel(null, {
			baseUrl: 'http://localhost:8000/api/v2',
			id: 10,
		});

		// model
		//     .fetch()
		//     .then((e: EloquentRequest) => {
		//         console.log('user model fetch', e.responseData);
		//         // console.log('a', model.attr('username'));
		//     })
		//     .catch((e: EloquentRequest) => {
		//         console.log('catching user erorr', e.response?.status);
		//         console.log(e.name);
		//     });

		collection.on('error', (e) => {
			console.log('on error');
		});

		collection
			.fetch()
			.then((e: EloquentRequest) => {
				// console.log('film model fetch', e);
				console.log('a', collection.at(0).attr('source_url'));
			})
			.catch((e: EloquentRequest) => {
				console.log('Collection Error', e.response?.status);

				// console.log(e);
			});

		// collection
		//     .fetch()
		//     .then((e: EloquentRequest) => {
		//         // console.log('film model fetch', e);
		//         console.log('b' , collection.at(0).attr('source_url'));
		//     });

		// setTimeout(() => {

		//     collection
		//     .fetch()
		//     .then((e: EloquentRequest) => {
		//         // console.log('film model fetch', e);
		//         console.log('b' , collection.at(0).attr('source_url'));
		//     });
		// }, 2000);

		// const url = 'https://staging-api.shortoftheweek.app/v1/not-real';
		// const url = 'https://staging-api.shortoftheweek.app/v1/film';
		// const body = null;
		// const headers = { };

		// var req = new Request(url);

		// req.fetch('post', body, headers)
		//     .then(e => {
		//         console.log('hi', e);
		//     })
		//     .catch(e => {
		//         console.log('error', e.response?.status);
		//     });

		// axios.get(url)
		// axios(url, {
		//     method: 'get',
		//     headers: {

		//     },
		//     redirect: 'follow',
		//     // method: 'post',
		//     withCredentials: false,
		// })
		// .then(e => {
		//     console.log('E', e);
		//     // console.log('Status', response.status);
		//     // console.log('Headers', response.headers);
		//     // console.log('Data', response.data);
		// })
		// .catch(error => {
		//     console.log('catch', error.message);
		//     console.log('catch', error.response.status);
		//     console.log('catch', error.response.statusText);
		//     // error.request
		//     // error.response.status
		//     // error.response.statusText
		//     // error.response.headers
		// });
	});
});
