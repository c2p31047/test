// app.js

import { getLocations } from './data.js';

// ページが読み込まれたらデータを読み込み、表示
document.addEventListener('DOMContentLoaded', () => {
    const locationsList = document.getElementById('locations-list');

    getLocations().then(locations => {
        if (locations) {
            // データを表示
            for (const key in locations) {
                if (locations.hasOwnProperty(key)) {
                    const location = locations[key];
                    const locationItem = document.createElement('div');
                    locationItem.innerHTML = `
                        <h3>${location.name}</h3>
                        <p>${location.description}</p>
                        <button onclick="reserveLocation('${key}')">予約</button>
                    `;
                    locationsList.appendChild(locationItem);
                }
            }
        }
    });
});

// 予約ボタンをクリックしたときの処理
function reserveLocation(locationId) {
    // ここで予約処理を実行するロジックを追加
    console.log(`場所 ${locationId} を予約しました。`);
}
