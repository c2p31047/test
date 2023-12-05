document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var locationId = calendarEl.getAttribute('data-location-id'); 
  var calendar = new FullCalendar.Calendar(calendarEl, {
    // カスタムの設定を追加する場合はここに追加
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      center: 'title',
      right: 'prev,next today'
    },
    initialView: 'timeGridWeek',
    locale: 'ja',
    buttonText: {
        prev:     '<',
        next:     '>',
        prevYear: '<<',
        nextYear: '>>',
        today:    '今日',
        month:    '月',
        week:     '週',
        day:      '日',
        list:     '一覧'
    },
    slotMinTime: "07:00:00",
    slotMaxTime: "21:00:00",
    allDaySlot: false,
    nowIndicator: true,
    editable: false,
    // イベントデータを非同期で取得
    events: `/api/location_reservations/${locationId}`,
    eventDrop: function(info) {
        var eventId = info.event.id;
        var newStart = info.event.start;
        var newEnd = info.event.end;

        // サーバーに新しい日時情報を送信
        $.ajax({
            url: '/update_reservation_time',
            method: 'POST',
            data: {
                eventId: eventId,
                newStart: newStart,
                newEnd: newEnd
            },
            success: function(response) {
                alert(response.message);
            },
            error: function(error) {
                console.error('Error updating reservation:', error);
            }
        });
    },
  });

  // カレンダーを描画
  calendar.render();
});

document.addEventListener('DOMContentLoaded', function () {
    // 終日予約のチェックボックス
    var isAllDayCheckbox = $('#is_all_day_checkbox');

    // 開始日付と終了日付のフィールド
    var startDateField = $('#start_date_picker');
    var endDateField = $('#end_date_picker');

    // 開始時間と終了時間のフィールド
    var startTimeField = $('#start_time_picker');
    var endTimeField = $('#end_time_picker');

    // 終日予約が変更されたときの処理
    isAllDayCheckbox.change(function () {
        // 終日予約が選択された場合
        if (isAllDayCheckbox.prop('checked')) {
            // 時間のフィールドを無効にする
            startTimeField.prop('disabled', true);
            endTimeField.prop('disabled', true);
        } else {
            // 終日予約が選択されていない場合はフィールドを有効にする
            startTimeField.prop('disabled', false);
            endTimeField.prop('disabled', false);
        }
    });

    // Flatpickrの設定
    flatpickr(startDateField[0], {
        enableTime: false,
        dateFormat: "Y-m-d",
    });

    flatpickr(endDateField[0], {
        enableTime: false,
        dateFormat: "Y-m-d",
    });

    flatpickr(startTimeField[0], {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
    });

    flatpickr(endTimeField[0], {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
    });
});

// FontAwesome JavaScript の読み込み
document.addEventListener("DOMContentLoaded", function() {
    // フォント アイコンの読み込みを開始
    FontAwesome.dom.i2svg();
});


// JavaScriptで右クリックメニューを表示する処理
document.getElementById('message-container').addEventListener('contextmenu', function(event) {
    event.preventDefault();
    const menu = event.target.closest('.message').querySelector('.right-click-menu');
    // 他のメッセージのメニューを非表示にする
    document.querySelectorAll('.right-click-menu').forEach(function(m) {
        if (m !== menu) {
        m.style.display = 'none';
        }
    });
    if (menu) {
        menu.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // 既存の予約データ
    var existingReservation = {
        title: "{{ reservation.title }}",
        start_date: "{{ reservation.start.strftime('%Y-%m-%d') }}",  // 'start_datetime'を'start'に修正
        start_time: "{{ reservation.start.strftime('%H:%M') }}",  // 'start_datetime'を'start'に修正
        end_date: "{{ reservation.end.strftime('%Y-%m-%d') }}",  // 'end_datetime'を'end'に修正
        end_time: "{{ reservation.end.strftime('%H:%M') }}",  // 'end_datetime'を'end'に修正
        is_all_day: "{{ 'true' if reservation.is_all_day else 'false' }}",
    };

    // 予約データをフォームにセット
    document.querySelector('form [name="title"]').value = existingReservation.title;
    document.querySelector('form [name="start_date"]').value = existingReservation.start_date;
    document.querySelector('form [name="start_time"]').value = existingReservation.start_time;
    document.querySelector('form [name="end_date"]').value = existingReservation.end_date;
    document.querySelector('form [name="end_time"]').value = existingReservation.end_time;
    document.querySelector('form [name="is_all_day"]').checked = existingReservation.is_all_day;
});

function showNotifications() {
    // サーバーサイドから未読の通知を取得するAjaxリクエスト
    $.ajax({
        type: 'GET',
        url: '/get_notifications',
        success: function(response) {
            // 通知一覧を更新
            updateNotificationDropdown(response.notifications);
        },
        error: function(error) {
            console.error('通知の取得に失敗しました', error);
        }
    });
}

function updateNotificationDropdown(notifications) {
    // 通知一覧をクリア
    $('#notificationContent').empty();

    // 未読の通知をドロップダウンに追加
    notifications.forEach(function(notification) {
        var notificationHtml = '<a class="dropdown-item" href="#">' + notification.content + '</a>';
        $('#notificationContent').append(notificationHtml);
    });

    // ドロップダウンを開く
    $('#notificationDropdown').dropdown('toggle');
}

// 通知アイコンがクリックされたときに通知を表示
$('#notificationDropdown').on('click', function() {
    showNotifications();
});