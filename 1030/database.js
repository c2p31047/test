// Firebaseの初期化（前回提供したコードと同じ設定を使用）
// Firebaseの初期化
var firebaseConfig = {
    apiKey: "AIzaSyDTS7OuSwFOqUXNHgWLwKARmV3cOcLN-Ec",
    authDomain: "projectc-01.firebaseapp.com",
    projectId: "projectc-01",
    storageBucket: "projectc-01.appspot.com",
    messagingSenderId: "282949999420",
    appId: "1:282949999420:web:bdae3b7002d2c853571c39",
    measurementId: "G-QDQJGHXYLP"
};
firebase.initializeApp(firebaseConfig);

// ロケーションの追加
function addLocation() {
    var locationName = document.getElementById("locationName").value;
    var database = firebase.database();
    var locationsRef = database.ref("locations");

    locationsRef.push({
        name: locationName
    });

    document.getElementById("add-location-form").reset();
}

// 現在登録されているロケーションの読み込み
function loadLocationData() {
    var locationSelect = document.getElementById("locationSelect");
    var locationName = locationSelect.value;
    var locationDataDiv = document.getElementById("locationData");
    var database = firebase.database();
    var locationRef = database.ref("locations/" + locationName);

    locationRef.once("value", function(snapshot) {
        var locationData = snapshot.val();
        locationDataDiv.innerHTML = "ロケーション名: " + locationData.name;
    });
}

// ロケーションの編集
function editLocation() {
    var locationSelect = document.getElementById("locationSelect");
    var locationName = locationSelect.value;
    var editedLocationName = document.getElementById("editLocationName").value;
    var database = firebase.database();
    var locationRef = database.ref("locations/" + locationName);

    locationRef.update({
        name: editedLocationName
    });

    document.getElementById("edit-location-form").reset();
}

// ロケーションの削除
function deleteLocation() {
    var locationSelect = document.getElementById("locationSelect");
    var locationName = locationSelect.value;
    var database = firebase.database();
    var locationRef = database.ref("locations/" + locationName);

    locationRef.remove();
    document.getElementById("locationData").innerHTML = "";
}

// 削除ボタンをクリックした際に確認ダイアログを表示
function confirmDeleteLocation() {
    document.getElementById("confirmation-dialog").style.display = "block";
}

// はいをクリックしたときに削除を実行
function deleteLocationConfirmed() {
    // 削除の実行コードをここに追加
    // 削除が完了したら確認ダイアログを非表示にする
    document.getElementById("confirmation-dialog").style.display = "none";
}

// キャンセルをクリックしたときに確認ダイアログを非表示
function cancelDeleteLocation() {
    document.getElementById("confirmation-dialog").style.display = "none";
}

// 削除ボタンをクリックした際にモーダルを表示
function openConfirmationModal() {
    document.getElementById("confirmation-modal").style.display = "block";
}

// はいをクリックしたときに削除を実行
function deleteLocationConfirmed() {
    // 削除の実行コードをここに追加
    // 削除が完了したらモーダルを非表示にする
    document.getElementById("confirmation-modal").style.display = "none";
}

// キャンセルをクリックしたときにモーダルを非表示
function closeConfirmationModal() {
    document.getElementById("confirmation-modal").style.display = "none";
}
