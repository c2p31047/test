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
const passwordResetForm = document.getElementById('password-reset-form');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const loginMessage = document.getElementById('login-message');
const redirectUrl = document.getElementById('redirect-url');
const resetMessage = document.getElementById('reset-message');


// ログインフォームの送信イベントを処理
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailField.value;
    const password = passwordField.value;

    // Firebase Authenticationを使用してログイン
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // ログイン成功時の処理
            const user = userCredential.user;
            loginMessage.textContent = 'ログインに成功しました。';
            loginMessage.style.color = 'green';
            window.location.href = redirectUrl; // ログイン後のリダイレクト
        })
        .catch((error) => {
            const errorMessage = error.message;
            loginMessage.textContent = 'ログインに失敗しました: ' + errorMessage;
            loginMessage.style.color = 'red';
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

passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailField.value;

    // Firebase Authenticationを使用して、パスワードリセットメールを送信
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            // パスワードリセットメールの送信に成功した場合の処理
            resetMessage.textContent = 'パスワードリセットメールを送信しました。メールボックスを確認してください。';
            resetMessage.style.color = 'green';
        })
        .catch((error) => {
            // パスワードリセットメールの送信に失敗した場合の処理
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('パスワードリセットエラー:', errorCode, errorMessage);

            // エラーメッセージを表示
            resetMessage.textContent = 'パスワードリセットメールの送信に失敗しました。';
            resetMessage.style.color = 'red';
        });

    // メール入力フィールドをクリア
    emailField.value = '';
});
