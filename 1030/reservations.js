// Firebaseの初期化（前回提供したコードと同じ設定を使用）
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

// リアルタイムで予約データを表示
var reservationList = document.getElementById("reservation-list");
var database = firebase.database();
var reservationsRef = database.ref("reservations");

reservationsRef.on("value", function(snapshot) {
    var reservations = snapshot.val();
    displayReservations(reservations);
});

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
