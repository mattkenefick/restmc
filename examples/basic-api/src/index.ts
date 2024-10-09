import CollectionVenue from './Collection/Venue';
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

	// Matches one
	const parlourItem = venueCollection.findWhere({ name: 'Parlour' });
	console.log('Parlour Item', parlourItem);

	const clonedParlourItem = parlourItem.clone();
	console.log(' -> Cloned Parlour', clonedParlourItem);

	// Matches both
	const parlourItem2 = venueCollection.where({
		name: 'Parlour',
		website: 'http://superfine.nyc',
	});
	console.log('Superfine Collection', parlourItem2);

	// Matches none
	const parlourItem3 = venueCollection.where(
		{
			name: 'Parlour',
			website: 'http://superfine.nyc',
		},
		false,
		true
	);
	console.log('Full Superfine Collection', parlourItem3);

	const response = await venueCollection.fetch();

	console.log('Fetch Response', response);
	console.log('\n\n');

	const clonedCollection = venueCollection.clone();
	console.log('Venue Collection', venueCollection);
	console.log(' -> Cloned Collection', clonedCollection);
}

// Run
// ---------------------------------------------------------------------------

fetchVenues();
