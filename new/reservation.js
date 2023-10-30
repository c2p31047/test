// reservation.js

import { getLocations } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const locationsList = document.getElementById('locations-list');
    const locationSelect = document.getElementById('location-select');

    getLocations().then(locations => {
        if (locations) {
            for (const key in locations) {
                if (locations.hasOwnProperty(key)) {
                    const location = locations[key];
                    const locationItem = document.createElement('div');
                    locationItem.innerHTML = `
                        <h3>${location.name}</h3>
                        <p>${location.description}</p>
                    `;
                    locationsList.appendChild(locationItem);

                    // 予約フォームの選択肢にロケーションを追加
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = location.name;
                    locationSelect.appendChild(option);
                }
            }
        }
    });
});

// 予約フォーム送信時の処理
document.getElementById('reservation-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const selectedLocationKey = document.getElementById('location-select').value;
    const selectedLocationName = document.getElementById('location-select').options[document.getElementById('location-select').selectedIndex].text;
    const reservationTime = document.getElementById('reservation-time').value;
    
    // ここで予約処理を実行するロジックを追加
    console.log(`ロケーション "${selectedLocationName}" を ${reservationTime} に予約しました。`);
});
