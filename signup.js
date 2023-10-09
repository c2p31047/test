// 新しいユーザーを作成
firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        // ユーザーデータをデータベースに保存
        database.ref('users/' + user.uid).set({
            username: username,
            email: email,
            // 他のユーザーデータ
        });
        res.status(201).json({ message: 'ユーザーが登録されました' });
    })
    .catch((error) => {
        console.error('ユーザーの作成中にエラーが発生しました:', error);
        res.status(500).json({ message: 'ユーザーの登録に失敗しました' });
    });
