import CollectionVenue from './Collection/Venue';
import CollectionMedia from './Collection/Media';
import ModelVenue from './Model/Venue';
import ApiData from './api-response';

/**
 * Add object to DOM
 *
 * @param ModelVenue
 * @return void
 */
function addVenue(venueModel: ModelVenue, parentElement: HTMLElement): void {
	const element: HTMLDivElement = document.createElement('div');
	element.innerHTML = [`<h1>${venueModel.getName()}</h1>`].join('');

	parentElement.appendChild(element);
}

/**
 * @return void
 */
async function fetchVenues(): Promise<void> {
	const parentElement: HTMLElement = document.querySelector('#app') as HTMLElement;
	const venueCollection: CollectionVenue = CollectionVenue.hydrate(ApiData.data);

	console.log('RESTMC VERSION', venueCollection.restmc);

	venueCollection.setOptions({
		withCredentials: false,
	});

	// venueCollection.setHeader('x-foo', 'bar');

	venueCollection.on('complete', (e) => {
		console.log('Received data: ', e);
	});

	console.log('Venue Collection', venueCollection);

	// Fetch remotely
	// await venueCollection.fetch();
	// await venueCollection.fetch();

	// Iterate through collection
	venueCollection.each((model: ModelVenue) => addVenue(model, parentElement));

	venueCollection.on('add:before', (e) => {
		console.log('Before add', e);
	});

	// // Matches one
	// const parlourItem = venueCollection.findWhere({ name: 'Parlour' });
	// console.log('Parlour Item', parlourItem);

	// const clonedParlourItem = parlourItem.clone();
	// console.log(' -> Cloned Parlour', clonedParlourItem);

	// // Matches both
	// const parlourItem2 = venueCollection.where({
	// 	name: 'Parlour',
	// 	website: 'http://superfine.nyc',
	// });
	// console.log('Superfine Collection', parlourItem2);

	// // Matches none
	// const parlourItem3 = venueCollection.where(
	// 	{
	// 		name: 'Parlour',
	// 		website: 'http://superfine.nyc',
	// 	},
	// 	false,
	// 	true
	// );
	// console.log('Full Superfine Collection', parlourItem3);

	// const response = await venueCollection.fetch();

	// console.log('Fetch Response', response);
	// console.log('\n\n');

	// const clonedCollection = venueCollection.clone();
	// console.log('Venue Collection', venueCollection);
	// console.log(' -> Cloned Collection', clonedCollection);

	// //
	// console.log('-----------------------------------------------------------');
	// console.log('Testing iterator filters...');

	// const iteratorFilter = (model: ModelVenue, index: number) => {
	// 	return model.getName().indexOf('Billiards') > 0;
	// };

	// let model;

	// for (model of clonedCollection.values(iteratorFilter)) {
	// 	console.log('Billards Places:', model.getName());
	// }

	// //
	// console.log('-----------------------------------------------------------');
	// console.log('Using .next(...)');

	// while ((model = clonedCollection.next(iteratorFilter))) {
	// 	console.log('Next Iterator', clonedCollection.index(), model.getName());
	// }

	// //
	// console.log('-----------------------------------------------------------');
	// console.log('Using .previous(...)');

	// while ((model = clonedCollection.previous(iteratorFilter))) {
	// 	console.log('Previous Iterator', clonedCollection.index(), model.getName());
	// }

	// //
	// console.log('-----------------------------------------------------------');
	// console.log('Using .next(...)');

	// while ((model = clonedCollection.next())) {
	// 	console.log('Next All Iterator', clonedCollection.index(), model.getName());
	// }

	// //
	// console.log('-----------------------------------------------------------');
	// console.log('Using .previous(...)');

	// while ((model = clonedCollection.previous())) {
	// 	console.log('Previous All Iterator', clonedCollection.index(), model.getName());
	// }

	//
	console.log('-----------------------------------------------------------');
	console.log('Relationships');

	const modelA = venueCollection.first();
	console.log('ModelA', modelA);
	console.log('JSON', modelA.toJSON());

	const mediaCollection = modelA.media.clone();
	console.log('Cloned media', mediaCollection);

	const hydratedCollection = CollectionMedia.hydrate(modelA.attributes.media);
	console.log('Hydrated media', hydratedCollection);

	// Remote Fetching
	// -------------------------------------------------------------------------

	const remoteCollection = new CollectionVenue();

	remoteCollection.setOptions({
		baseUrl: 'https://api.chalkysticks.com/v3',
		cacheable: true,
	});

	// remoteCollection.getBaseUrl = function () {
	// 	console.log('Bro', this.baseUrl, this);
	// 	return 'https://forkforkfork.com';
	// };

	for (let i = 0; i < 5; i++) {
		console.log(`Fetch ${i} ---------------------------------------------- `);
		await remoteCollection.fetch();
	}
}

// Run
// ---------------------------------------------------------------------------

fetchVenues();
