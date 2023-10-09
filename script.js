document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const menu = document.querySelector(".menu");

    hamburger.addEventListener("click", function () {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        // ログイン処理を実行
    });
});

// ログイン後の処理
function handleLoginSuccess(user) {
    // ログイン成功時の処理をここに記述

    // ユーザープロフィールを表示するなど、適切なアクションを実行
    // 以下は例として、ユーザー名を表示するコードです。
    const usernameElement = document.getElementById("username");
    usernameElement.textContent = user.username;
    
    // ユーザープロフィールページにリダイレクトなども可能
    // window.location.href = "/profile";
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
                handleLoginSuccess(user);
            } else {
                // ログイン失敗時
                alert("ログインに失敗しました。ユーザー名とパスワードを確認してください。");
            }
        } catch (error) {
            console.error("エラーが発生しました:", error);
        }
    });
});
