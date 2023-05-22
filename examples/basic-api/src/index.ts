import CollectionUser from './Collection/User';
import ModelUser from './Model/User';

/**
 * Add user object to DOM
 *
 * @param ModelUser
 * @return void
 */
function addUser(userModel: ModelUser, parentElement: HTMLElement): void {
	const element: HTMLDivElement = document.createElement('div');
	element.innerHTML = [`<h1>${userModel.getUsername()}</h1>`].join('');

	parentElement.appendChild(element);
}

/**
 * @return void
 */
async function fetchUsers(): Promise<void> {
	const parentElement: HTMLElement = document.querySelector('#app') as HTMLElement;
	const userCollection: CollectionUser = new CollectionUser();

	// userCollection.setHeader('x-foo', 'bar');

	userCollection.on('complete', (e) => {
		console.log('Received data: ', e);
	});

	// Fetch remotely
	// await userCollection.fetch();
	await userCollection.fetch();

	// Iterate through collection
	userCollection.each((model: ModelUser) => addUser(model, parentElement));
}

// Run
// ---------------------------------------------------------------------------

fetchUsers();
