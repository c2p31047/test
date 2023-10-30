// form.js
import firebase from 'firebase/app';
import 'firebase/database';

document.getElementById("add-location-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const locationName = document.getElementById("location-name").value;
    const locationDescription = document.getElementById("location-description").value;

    // データベースに場所を追加
    const newLocationRef = database.ref("locations").push();
    newLocationRef.set({
        name: locationName,
        description: locationDescription
    });

    // フォームをクリア
    document.getElementById("location-name").value = "";
    document.getElementById("location-description").value = "";
});
