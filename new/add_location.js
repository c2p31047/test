// add_location.js

// Firebaseの設定とデータベース参照
import { database } from './firebase.js';

// フォーム要素と入力フィールドを取得
const addLocationForm = document.getElementById('add-location-form');
const locationNameInput = document.getElementById('location-name');
const locationDescriptionInput = document.getElementById('location-description');

// フォームの送信イベントリスナーを追加
addLocationForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // フォームから入力値を取得
    const locationName = locationNameInput.value;
    const locationDescription = locationDescriptionInput.value;

    // ロケーションをデータベースに追加
    const locationsRef = database.ref('locations');
    const newLocationRef = locationsRef.push();
    
    // ロケーション情報を設定
    newLocationRef.set({
        name: locationName,
        description: locationDescription
    }, (error) => {
        if (error) {
            console.error('ロケーションの追加に失敗しました:', error);
        } else {
            console.log('新しいロケーションがデータベースに追加されました');
            // フォームをクリア
            locationNameInput.value = '';
            locationDescriptionInput.value = '';
        }
    });
});
