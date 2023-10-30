// data.js

import { database } from './firebase.js';

function getLocations() {
    return database.ref('locations').once('value')
        .then(snapshot => snapshot.val())
        .catch(error => console.error(error));
}
