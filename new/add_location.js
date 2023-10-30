// add_location.js

import { database, auth } from './firebase.js';

// Firebaseの認証状態を監視
auth.onAuthStateChanged(user => {
    if (user) {
        // ログイン済みの場合は何もしない
        console.log('ユーザーがログインしています:', user);
    } else {
        // 未ログインの場合はログインページにリダイレクト
        console.log('ユーザーが未ログインです。ログインページにリダイレクトします。');
        window.location.replace('login.html'); // ログインページのURLに置き換えてください
    }
});

// フォームの送信イベントリスナーを追加
const addLocationForm = document.getElementById('add-location-form');
const locationNameInput = document.getElementById('location-name');
const locationDescriptionInput = document.getElementById('location-description');

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
