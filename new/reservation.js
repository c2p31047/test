// reservation.js
import { database } from './firebase.js';
import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDTS7OuSwFOqUXNHgWLwKARmV3cOcLN-Ec",
  authDomain: "projectc-01.firebaseapp.com",
  databaseURL: "https://projectc-01-default-rtdb.firebaseio.com",
  projectId: "projectc-01",
  storageBucket: "projectc-01.appspot.com",
  messagingSenderId: "282949999420",
  appId: "1:282949999420:web:bdae3b7002d2c853571c39",
  measurementId: "G-QDQJGHXYLP"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

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
