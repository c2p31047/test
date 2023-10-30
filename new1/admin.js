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

// 管理者の認証状態を確認
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // ログイン中のユーザーが管理者の場合の処理
    } else {
        // 管理者でない場合の処理
        window.location.href = 'login.html'; // ログインページにリダイレクト
    }
});

// ログアウト処理
document.getElementById('logout-button').addEventListener('click', function() {
    firebase.auth().signOut().then(function() {
        window.location.href = 'login.html'; // ログインページにリダイレクト
    }).catch(function(error) {
        // ログアウト中にエラーが発生した場合の処理
    });
});

// データの追加
document.getElementById('data-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var key = document.getElementById('key').value;
    var value = document.getElementById('value').value;
    var dataRef = database.ref('data');
    dataRef.update({ [key]: value });
});

// データの表示
var dataList = document.getElementById('data-list');
var dataRef = database.ref('data');
dataRef.on('child_added', function(snapshot) {
    var data = snapshot.val();
    var li = document.createElement('li');
    li.textContent = snapshot.key + ': ' + data;
    dataList.appendChild(li);
});
