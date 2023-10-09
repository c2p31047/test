// Firebaseの設定
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
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

    // Firebase Authenticationを使用してログイン
    firebase.auth().signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            // ログイン成功時の処理
            window.location.href = 'home.html'; // ログイン後のリダイレクト
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
