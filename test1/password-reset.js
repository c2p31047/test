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
const resetEmailField = document.getElementById('reset-email');

passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const resetEmail = resetEmailField.value;

    // パスワードリセットのリクエストを送信
    firebase.auth().sendPasswordResetEmail(resetEmail)
        .then(() => {
            // パスワードリセットのリクエストが成功した場合の処理
            alert('パスワードリセットのリンクを送信しました。');
            window.location.href = 'index.html'; // ログインページにリダイレクト
        })
        .catch((error) => {
            console.error('パスワードリセットリクエストの送信中にエラーが発生しました:', error);
            alert('パスワードリセットのリクエストの送信に失敗しました。');
        });
});
