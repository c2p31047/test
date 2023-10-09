// ユーザーの登録
firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('ユーザーが登録されました:', user);
    })
    .catch((error) => {
        console.error('ユーザーの登録中にエラーが発生しました:', error);
    });

// ユーザーのログイン
firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('ユーザーがログインしました:', user);
    })
    .catch((error) => {
        console.error('ユーザーのログイン中にエラーが発生しました:', error);
    });
