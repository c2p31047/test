// reservation.js

import { database } from './firebase.js';

const addLocationForm = document.getElementById('add-location-form');
const locationNameInput = document.getElementById('location-name');
const locationList = document.getElementById('location-list');

// ロケーション情報をデータベースから読み込む関数
function loadLocations() {
    const locationsRef = database.ref('locations');
    locationsRef.on('value', (snapshot) => {
        locationList.innerHTML = ''; // 既存のロケーション一覧をクリア

        snapshot.forEach((childSnapshot) => {
            const location = childSnapshot.val();
            const locationItem = document.createElement('li');
            locationItem.textContent = location.name;
            locationList.appendChild(locationItem);
        });
    });
}

// フォームの送信イベントリスナーを追加
addLocationForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // フォームから入力値を取得
    const locationName = locationNameInput.value;

    // ロケーションをデータベースに追加
    const locationsRef = database.ref('locations');
    const newLocationRef = locationsRef.push();
    newLocationRef.set({
        name: locationName
    });

    // フォームをクリア
    locationNameInput.value = '';
});

// ロケーション情報を読み込む
loadLocations();
