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
const newUsernameField = document.getElementById('new-username');
const newEmailField = document.getElementById('new-email');
const newPasswordField = document.getElementById('new-password');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUsername = newUsernameField.value;
    const newEmail = newEmailField.value;
    const newPassword = newPasswordField.value;

    // Firebase Authenticationを使用して新規ユーザーを登録
    firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword)
        .then((userCredential) => {
            // ユーザー作成成功時の処理
            const user = userCredential.user;
            // ユーザー名を設定（任意）
            user.updateProfile({
                displayName: newUsername,
            }).then(() => {
                console.log('ユーザーが登録されました:', user);
                alert('新しいユーザーが登録されました。');
                window.location.href = 'index.html'; // 登録後のリダイレクト
            }).catch((error) => {
                console.error('ユーザー名の設定中にエラーが発生しました:', error);
            });
        })
        .catch((error) => {
            console.error('新規ユーザーの登録中にエラーが発生しました:', error);
            alert('新規ユーザーの登録に失敗しました。');
        });
});
