let map;
let marker;
let user_id = null;
let markers = []; 

// ページ読み込み時にログインユーザー情報を取得
window.addEventListener('load', function() {
    fetch('/get_user_info')
        .then(response => response.json())
        .then(data => {
            if (data) {
                user_id = data.user_id;
                //console.log('Logged in. User ID:', user_id);
                
                // ユーザー名のデータを取得
                fetch('/get_users')
                    .then(response => response.json())
                    .then(userData => {
                        if (userData && userData.users) {
                            const usernames = userData.users.map(user => user.username);
                            //console.log('Usernames:', usernames);

                            // ここでユーザー名のデータを使って何かしらの処理を行う
                            // 例: ユーザー名を表示する、特定のユーザー名に関連するマーカーを作成するなど

                            // ユーザーロケーションデータを取得する
                            fetch('/get_user_locations')
                                .then(response => response.json())
                                .then(userLocations => {
                                    // ユーザーロケーションデータを元にマーカーを作成
                                    userLocations.forEach(user => {
                                        const userMarker = new google.maps.Marker({
                                            position: { lat: user.lat, lng: user.lng },
                                            map: map,
                                            title: user.name,
                                            icon: user.id === user_id ? 'static/img/custom-icon-self.png' : 'static/img/custom-icon-other.png' // アイコンのパスを指定
                                        });

                                        // ユーザー名を表示するための div 要素を作成
                                        const userNameDiv = document.createElement('div');
                                        userNameDiv.innerHTML = `<b>${user.name}</b>`;

                                        // ユーザー名を含む情報ウィンドウを作成
                                        const infowindow = new google.maps.InfoWindow({
                                            content: userNameDiv,
                                        });

                                        // マーカーをクリックしたときにユーザー情報を表示するポップアップを追加
                                        userMarker.addListener('click', () => {
                                            infowindow.open(map, userMarker);
                                        });

                                        markers.push(userMarker);
                                    });
                                })
                                .catch(error => console.error('エラー:', error));
                        }
                    })
                    .catch(error => console.error('Error fetching user data:', error));
            } else {
                console.log('Not logged in.');
            }
        })
        .catch(error => console.error('Error:', error));
});


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 13
    });

    marker = new google.maps.Marker({
        map: map,
        position: { lat: 0, lng: 0 },
        title: '現在の位置',
        icon: 'static/img/custom-icon-self.png' // 自分のアイコンのパスを指定
    });

    // 位置情報取得ボタンのクリックイベント
    document.getElementById('getLocation').addEventListener('click', getLocation);

    // 数秒ごとに位置情報を更新
    setInterval(getLocation, 5000); // 5000 milliseconds = 5 seconds

    // ユーザーロケーションデータを取得する
    fetch('/get_user_locations')
        .then(response => response.json())
        .then(userLocations => {
            //console.log('User Locations:', userLocations);
            // ユーザーロケーションデータを元にマーカーを作成
            userLocations.forEach(user => {
                // ユーザー名を取得する
                fetch(`/get_user/${user.user_id}`)
                    .then(response => response.json())
                    .then(userData => {
                        const userName = userData.username;

                        const userMarker = new google.maps.Marker({
                            position: { lat: user.lat, lng: user.lng },
                            map: map,
                            // マーカーのtitleプロパティは削除
                            icon: user.id === user_id ? 'static/img/custom-icon-self.png' : 'static/img/custom-icon-other.png'
                        });

                        // ユーザー名を表示するための div 要素を作成
                        const userNameDiv = document.createElement('div');
                        userNameDiv.innerHTML = `<b>${userName}</b>`;

                        // ユーザー名を含む情報ウィンドウを作成
                        const infowindow = new google.maps.InfoWindow({
                            content: userNameDiv,
                        });

                        // マーカーをクリックしたときにユーザー情報を表示するポップアップを追加
                        userMarker.addListener('click', () => {
                            infowindow.open(map, userMarker);
                        });

                        markers.push(userMarker);
                    })
                    .catch(error => console.error('Error fetching user data:', error));
            });
        })
        .catch(error => console.error('エラー:', error));
}



function getLocation() {
    // ユーザーがログインしているか確認
    if (user_id !== null) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // マーカーの位置を更新
                marker.setPosition(location);

                // 地図を指定位置に移動
                map.setCenter(location);

                // 位置情報を表示
                document.getElementById('locationText').textContent = '緯度: ' + location.lat + ', 経度: ' + location.lng;

                // サーバーに位置情報を送信
                sendLocationToServer(location.lat, location.lng);
            }, function (error) {
                handleLocationError(error);
            });
        } else {
            alert('ブラウザが位置情報をサポートしていません。');
        }
    } else {
        console.log('ユーザーがログインしていません。');
    }
}

// Google Maps APIの非同期読み込み
function loadScript() {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAFcyIINxfRta3BSgR66oUdlS6BPEcnLsA&callback=initMap'; // Replace YOUR_API_KEY with your actual API key
    script.defer = true;
    document.head.appendChild(script);
}

// ページ読み込み後にGoogle Maps APIを読み込む
window.addEventListener('load', loadScript);
// ページ読み込み後にGoogle Maps APIを読み込む
window.addEventListener('load', loadScript);

// ログイン機能がある場合、ログイン時にユーザーIDを設定する
function loginUser(userID) {
    user_id = userID;
    //console.log('Logged in. User ID:', user_id);

    getLocation();
}

// サーバーに位置情報を送信する関数
function sendLocationToServer(latitude, longitude) {
    fetch('/save_location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: user_id,
            latitude: latitude,
            longitude: longitude,
        }),
    })
    .then(response => response.json())
    //.then(data => console.log(data))
    .catch(error => console.error('エラー:', error));
    // console.log('Request Data:', { user_id, latitude, longitude });
}

function handleLocationError(error) {
    console.error('位置情報の取得中にエラーが発生しました:', error.message);
}
