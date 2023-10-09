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

// 新規登録フォーム
const signupForm = document.getElementById('signup-form');
const usernameField = document.getElementById('username');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const googleSignupButton = document.getElementById('google-signup-button');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameField.value;
    const email = emailField.value;
    const password = passwordField.value;

    // Firebase Authenticationを使用して新しいユーザーを作成
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // 新規登録成功時の処理
            console.log('新しいユーザーが登録されました:', userCredential.user);
            alert('新しいユーザーが登録されました！');
            // ログインページにリダイレクトするか、任意のページにリダイレクトします。
            // window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('新規登録エラー:', error);
            alert('新規登録に失敗しました。');
        });
});

// Googleサインインボタンのクリックをリッスン
googleSignupButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Google認証プロバイダのインスタンスを作成
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

    // Googleサインインを開始
    firebase.auth().signInWithPopup(googleAuthProvider)
        .then((userCredential) => {
            // Googleサインイン成功時の処理
            const user = userCredential.user;
            // ログイン後のリダイレクトなどの処理を追加
        })
        .catch((error) => {
            // Googleサインイン失敗時の処理
            const errorMessage = error.message;
            console.error('Googleサインインエラー:', errorMessage);
        });
});
