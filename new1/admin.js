// Firebaseの初期化
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
