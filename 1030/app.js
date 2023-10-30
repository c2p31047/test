// Firebaseの初期化
var firebaseConfig = {
    apiKey: "AIzaSyDTS7OuSwFOqUXNHgWLwKARmV3cOcLN-Ec",
    authDomain: "projectc-01.firebaseapp.com",
    projectId: "projectc-01",
    storageBucket: "projectc-01.appspot.com",
    messagingSenderId: "282949999420",
    appId: "1:282949999420:web:bdae3b7002d2c853571c39",
    measurementId: "G-QDQJGHXYLP"
};
firebase.initializeApp(firebaseConfig);

// 予約データをデータベースから取得
function getReservations() {
    var database = firebase.database();
    var reservationsRef = database.ref("reservations");

    reservationsRef.on("value", function(snapshot) {
        var reservations = snapshot.val();

        // 予約データを処理
        for (var key in reservations) {
            if (reservations.hasOwnProperty(key)) {
                var reservation = reservations[key];
                // ここで予約データを使用して処理することができます
            }
        }
    });
}

// 予約データをデータベースに書き込む
function makeReservation() {
    var place = document.getElementById("place").value;
    var date = document.getElementById("date").value;

    var database = firebase.database();
    var reservationsRef = database.ref("reservations");

    // 予約データをデータベースから取得
    getReservations();

    // 予約の重複をチェック
    reservationsRef.once("value").then(function(snapshot) {
        var reservations = snapshot.val();
        var isAvailable = true;

        for (var key in reservations) {
            if (reservations.hasOwnProperty(key)) {
                var reservation = reservations[key];
                if (reservation.place === place && reservation.date === date) {
                    isAvailable = false;
                    break;
                }
            }
        }

        // 予約の重複がない場合の処理
        if (isAvailable) {
            // 予約情報を追加
            reservationsRef.push({
                place: place,
                date: date
            });

            // フォームをリセット
            document.getElementById("reservation-form").reset();
        } else {
            alert("選択した場所と日付は既に予約されています。別の場所または日付を選択してください。");
        }
    });
}

// リアルタイムで予約データを表示
var reservationList = document.getElementById("reservation-list");
getReservations();

function displayReservations(reservations) {
    reservationList.innerHTML = "";
    for (var key in reservations) {
        if (reservations.hasOwnProperty(key)) {
            var reservation = reservations[key];
            var reservationItem = document.createElement("div");
            reservationItem.innerHTML = "場所: " + reservation.place + ", 日付: " + reservation.date;
            reservationList.appendChild(reservationItem);
        }
    }
}

var database = firebase.database();
var reservationsRef = database.ref("reservations");

reservationsRef.on("value", function(snapshot) {
    var reservations = snapshot.val();
    displayReservations(reservations);
});
