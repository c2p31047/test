const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 静的ファイルのディレクトリを指定
app.use(express.static(path.join(__dirname, 'public')));

// テンプレートエンジンの設定（例: Express Handlebarsを使用）
const exphbs = require('express-handlebars');
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// ミドルウェアの設定
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ルートの設定
const indexRoutes = require('./routes/indexRoutes'); // トップページのルート
const loginRoutes = require('./routes/loginRoutes'); // ログインページのルート
const signupRoutes = require('./routes/signupRoutes'); // 新規登録ページのルート
// 他のルートを追加する場合はここに追加

app.use('/', indexRoutes);
app.use('/login', loginRoutes);
app.use('/signup', signupRoutes);
// 他のルートを追加する場合はここに追加

// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーがポート${port}で実行中...`);
});
