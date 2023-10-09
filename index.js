// 必要なモジュールをインポート
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Expressアプリケーションを作成
const app = express();

// ミドルウェアの設定
app.use(bodyParser.urlencoded({ extended: true }));

// MySQLデータベースに接続
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'mysql'
});

db.connect((err) => {
    if (err) {
        console.error('データベースに接続できませんでした:', err);
        throw err;
    }
    console.log('データベースに接続しました');
});

// 新規登録フォームのPOSTリクエストを処理
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    const user = { username, email, password };

    // usersテーブルに新しいユーザーを挿入
    db.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) {
            console.error('データベースへの挿入中にエラーが発生しました:', err);
            res.status(500).json({ message: 'ユーザーの登録に失敗しました' });
        } else {
            console.log('新しいユーザーがデータベースに登録されました');
            res.status(201).json({ message: 'ユーザーが登録されました' });
        }
    });
});

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
});
