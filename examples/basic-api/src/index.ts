import CollectionUser from './Collection/User';

//
const userCollection: CollectionUser = new CollectionUser();

// fetch
userCollection.fetch().then(() => {
	console.log(userCollection.at(0).getUsername());
});
