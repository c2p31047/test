const mysql = require('mysql');

// MySQLデータベースに接続
const db = mysql.createConnection({
    host: '127.0.0.1',      // データベースのホスト名
    user: 'root',   // データベースユーザー名
    password: '', // データベースパスワード
    database: 'test' // データベース名
});

// データベースへの接続を確立
db.connect((err) => {
    if (err) {
        console.error('データベースに接続できませんでした:', err);
        throw err;
    }
    console.log('データベースに接続しました');
});

// 新規登録フォームからのPOSTリクエストを処理
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;

    // ユーザー情報をデータベースに挿入するSQLクエリ
    const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';

    // パスワードをハッシュ化する処理（例：bcryptを使用）
    // パスワードハッシュ化ライブラリのインポート
    const bcrypt = require('bcryptjs');
    
    // パスワードをハッシュ化
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('パスワードのハッシュ化中にエラーが発生しました:', err);
            res.status(500).json({ message: 'ユーザーの登録に失敗しました' });
        } else {
            // パスワードをハッシュ化した値を使用してデータベースに挿入
            db.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('データベースへの挿入中にエラーが発生しました:', err);
                    res.status(500).json({ message: 'ユーザーの登録に失敗しました' });
                } else {
                    console.log('新しいユーザーがデータベースに登録されました');
                    res.status(201).json({ message: 'ユーザーが登録されました' });
                }
            });
        }
    });
});
