import CollectionLeague from './Collection/League';
import ModelLeague from './Model/League';

/**
 * Add entry object to DOM
 *
 * @param ModelLeague
 * @return void
 */
function addUser(entryModel: ModelLeague, parentElement: HTMLElement): void {
	const element: HTMLDivElement = document.createElement('div');
	element.innerHTML = [
		`<img src="${entryModel.logo.getDark()}" width="75" />`,
		`<h2>${entryModel.getName()}</h2>`,
		'<hr />',
	].join('');

	parentElement.appendChild(element);
}

/**
 * @return void
 */
async function fetchLeague(): Promise<void> {
	const parentElement: HTMLElement = document.querySelector('#app') as HTMLElement;
	const leagueCollection: CollectionLeague = new CollectionLeague();
	await leagueCollection.fetch();
	leagueCollection.each((model: ModelLeague) => addUser(model, parentElement));
}

// Run
// ---------------------------------------------------------------------------

fetchLeague();
