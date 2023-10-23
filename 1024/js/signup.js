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

// 新規登録フォーム
const signupForm = document.getElementById('signup-form');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const googleSignupButton = document.getElementById('google-signup');

// ページが完全に読み込まれた後にコードを実行
document.addEventListener('DOMContentLoaded', function() {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

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
});