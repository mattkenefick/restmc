import ModelUser from './Model/User';
import ApiData from './api-response';

const data = {
	id: 1,
	name: 'Matt Kenefick',
	slug: 'matt-kenefick',
	lat: 40.8,
	lon: -73.968,
	latitude: 40.8,
	longitude: -73.968,
	status: '',
	wallet: {
		id: 4232,
		user_id: 1,
		challenger_id: null,
		transaction: 75,
		source: 'collection',
		source_id: 0,
		created_at: '2024-11-06T23:28:33.000000Z',
		updated_at: '2024-11-06T23:28:33.000000Z',
	},
	wallet_balance: 3900,
	is_social: false,
	is_facebook: false,
	is_twitter: false,
	games: {},
	media: {
		data: [],
	},
	meta: {},
};

const user = new ModelUser(data);

const json = user.toJSON();
const str = JSON.stringify(json, null, 4);

console.log('----------------------------------------------------------------');
console.log('User', json);
