// Firebaseの初期化
var firebaseConfig = {
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
var database = firebase.database();

// 予約ボタンがクリックされたときの処理
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var location = document.getElementById('location').value;
    var datetime = document.getElementById('datetime').value;

    // Firebase Realtime Database内で場所と日時が一致する予約情報をクエリ
    var reservationsRef = database.ref('reservations');
    reservationsRef.orderByChild('location').equalTo(location).once('value', function(snapshot) {
        var isAvailable = true;
        snapshot.forEach(function(childSnapshot) {
            var reservation = childSnapshot.val();
            if (reservation.datetime === datetime) {
                isAvailable = false;
            }
        });

        if (isAvailable) {
            // 予約が可能な場合、Firebase Realtime Databaseに新しい予約を追加
            var newReservationRef = reservationsRef.push();
            newReservationRef.set({
                location: location,
                datetime: datetime,
                user: firebase.auth().currentUser.uid // ログインユーザーのUID
            });
            alert('予約が完了しました！');
        } else {
            alert('指定した場所と日時は既に予約されています。');
        }
    });
});
