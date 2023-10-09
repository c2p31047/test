// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyBbwKVEZxyAR8huecODyDB-o9iOaXQ33Js",
    authDomain: "test-2d53b.firebaseapp.com",
    projectId: "test-2d53b",
    storageBucket: "test-2d53b.appspot.com",
    messagingSenderId: "589505704797",
    appId: "1:589505704797:web:8cedccf9c716c9af136eb4",
    measurementId: "G-39E2NFDDQ8"
  };

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// ログインフォーム
const loginForm = document.getElementById('login-form');
const usernameField = document.getElementById('username');
const passwordField = document.getElementById('password');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameField.value;
    const password = passwordField.value;
    const redirectUrl = document.getElementById('redirect-url').value; // リダイレクト先のURL

    // Firebase Authenticationを使用してログイン
    firebase.auth().signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            // ログイン成功時の処理
            window.location.href = redirectUrl; // ログイン後のリダイレクト
        })
        .catch((error) => {
            console.error('ログインエラー:', error);
            alert('ログインに失敗しました。');
        });
});

// Googleアカウントでログイン
const googleLoginButton = document.getElementById('google-login');
googleLoginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    // Googleアカウントでログイン
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // ログイン成功時の処理
            window.location.href = 'home.html'; // ログイン後のリダイレクト
        })
        .catch((error) => {
            console.error('Googleログインエラー:', error);
            alert('Googleログインに失敗しました。');
        });
});
