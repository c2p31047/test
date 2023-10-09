// ログイン成功時や条件が満たされた場合にトップページにリダイレクトする関数
function redirectToTopPage() {
    window.location.href = "/"; // リダイレクト先のURLを指定
}

// ログインフォームのサブミットイベントを処理
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // ログインAPIなどを呼び出して認証を行う
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // ログイン成功時
                const user = await response.json();
                // ログイン成功時にトップページにリダイレクト
                redirectToTopPage();
            } else {
                // ログイン失敗時
                alert("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    });
});
