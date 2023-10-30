// add_location.js

import { database } from './firebase.js';

const addLocationForm = document.getElementById('add-location-form');
const locationNameInput = document.getElementById('location-name');
const locationDescriptionInput = document.getElementById('location-description');

addLocationForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const locationName = locationNameInput.value;
    const locationDescription = locationDescriptionInput.value;

    // ロケーションをデータベースに追加
    const locationsRef = database.ref('locations');
    const newLocationRef = locationsRef.push();
    newLocationRef.set({
        name: locationName,
        description: locationDescription
    });

    // ロケーションが追加されたら、ページをリダイレクトまたは他の操作を行うことができます。
    alert('新しいロケーションが追加されました');
    
    // フォームをクリア
    locationNameInput.value = '';
    locationDescriptionInput.value = '';
});
