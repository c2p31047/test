// Firebaseの設定
  const firebaseConfig = {
    apiKey: "AIzaSyDTS7OuSwFOqUXNHgWLwKARmV3cOcLN-Ec",
    authDomain: "projectc-01.firebaseapp.com",
    projectId: "projectc-01",
    storageBucket: "projectc-01.appspot.com",
    messagingSenderId: "282949999420",
    appId: "1:282949999420:web:bdae3b7002d2c853571c39",
    measurementId: "G-QDQJGHXYLP"
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
