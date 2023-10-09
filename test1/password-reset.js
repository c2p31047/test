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

// パスワードリセットフォーム
const passwordResetForm = document.getElementById('password-reset-form');
const resetMessage = document.getElementById('resetMessage');
const emailField = document.getElementById('email');

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
