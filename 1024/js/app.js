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

// ログインフォーム
const loginForm = document.getElementById('login-form');
const passwordResetForm = document.getElementById('password-reset-form');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const loginMessage = document.getElementById('login-message');
const redirectUrl = document.getElementById('redirect-url').value;
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
            loginMessage.textContent = 'ログインに失敗しました: ';
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
function signIn() {
  firebase.auth().signInWithPopup(provider)
  .then(result => {
      console.log('ログインしました。');

  }).catch(error => {
        const signinError = `
        サインインエラー
        エラーメッセージ： ${error.message}
        エラーコード: ${error.code}
        `
  　　　console.log(signinError);
  });
  }

  function signOut() {
  firebase.auth().onAuthStateChanged(user => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('ログアウトしました');
        location.reload();
      })
      .catch((error) => {
        console.log(`ログアウト時にエラーが発生しました (${error})`);
      });
  });
  }

