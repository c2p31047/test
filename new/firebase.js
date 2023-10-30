// firebase.js
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth'; // auth モジュールを追加

// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyDTS7OuSwFOqUXNHgWLwKARmV3cOcLN-Ec",
  authDomain: "projectc-01.firebaseapp.com",
  databaseURL: "https://projectc-01-default-rtdb.firebaseio.com",
  projectId: "projectc-01",
  storageBucket: "projectc-01.appspot.com",
  messagingSenderId: "282949999420",
  appId: "1:282949999420:web:bdae3b7002d2c853571c39",
  measurementId: "G-QDQJGHXYLP"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// データベース参照
const database = firebase.database();
const auth = firebase.auth(); // auth モジュールをエクスポート

export { database, auth }; // database と auth をエクスポート
