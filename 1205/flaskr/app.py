from flask import Flask, render_template, redirect, url_for, request, flash, jsonify, abort, g
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, FileField, BooleanField, TextAreaField, DateField, TimeField, SelectField
from wtforms.validators import DataRequired, Email
from werkzeug.security import generate_password_hash, check_password_hash
import os
from models import Location, Reservation
from forms import AdminForm, ReservationForm
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import relationship
import logging
from datetime import datetime, date, time
from itertools import groupby
from operator import attrgetter
from flask_apscheduler import APScheduler
from wtforms.validators import DataRequired, ValidationError, Optional


# Cloud SQL接続情報
INSTANCE_CONNECTION_NAME = "rare-chiller-406009:us-west1:flask"
# DB_USER = "root"
# DB_PASSWORD = "test"
# DB_NAME = "test2"
# socket_dir = "/cloudsql"

db_user = 'root'
db_password = 'test'
db_name = 'test2'
cloud_sql_ip = '10.43.112.3'

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)

app.config['SECRET_KEY'] = 'your_secret_key'

# Local(ローカル作業時はCloudSQLをコメントアウト)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///your_database.db'

# CloudSQL
#app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{cloud_sql_ip}/{db_name}?unix_socket=/cloudsql/{INSTANCE_CONNECTION_NAME}'

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 不要な警告を抑制
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


# index.html Button
buttons_data = [
    {"label": "予約画面", "url": "/reservation", "descripttion": "教室の予約を行うことができます", "show_for_admin": False},
    {"label": "連絡画面", "url": "/contact", "descripttion": "連絡を取ることができます", "show_for_admin": False},
    {"label": "位置情報画面", "url": "/map", "descripttion": "教員の位置情報を取得できます", "show_for_admin": False},
    {"label": "管理者追加", "url": "/add_admin", "descripttion": "教室の追加などが可能な管理者を追加できます", "show_for_admin": True},
    {"label": "教室追加", "url": "/add_location", "descripttion": "予約可能な教室を追加することができます ※Admin Only", "show_for_admin": True}
]


# DB Class
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(255), nullable=False)
    floor = db.Column(db.Integer, nullable=False)

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    domain = db.Column(db.String(255), nullable=True)

class Reservation(db.Model):
    __tablename__ = 'reservation'
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    title = db.Column(db.String(255), nullable=True)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    responsible_user = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(255), nullable=False)

class Message(db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Conversation(db.Model):
    __tablename__ = 'conversation'
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.relationship('Message', backref='conversation', lazy=True, primaryjoin="or_(Conversation.id == Message.conversation_id, and_(Conversation.user1_id == Message.sender_id, Conversation.user2_id == Message.recipient_id))")
    other_user_id = db.Column(db.Integer, nullable=True)

    # user1 と user2 の関連を設定
    user1 = db.relationship('User', foreign_keys=[user1_id], backref='conversations1')
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='conversations2')

    def other_user(self, current_user_id):
        # 他のユーザーを返すロジックを実装
        return self.user1 if self.user2.id == current_user_id else self.user2

class UserLocation(db.Model):
    __tablename__ = 'userlocation'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, unique=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)


# Form Class
class LoginForm(FlaskForm):
    email = StringField('メールアドレス', validators=[DataRequired()])
    password = PasswordField('パスワード', validators=[DataRequired()])
    submit = SubmitField('ログイン')

class StartConversationForm(FlaskForm):
    submit = SubmitField('Start New Conversation')

class ReservationForm(FlaskForm):
    start_date = DateField('開始日', format='%Y-%m-%d', validators=[DataRequired()])
    start_time = TimeField('開始時間', format='%H:%M', validators=[Optional()])
    end_date = DateField('終了日', format='%Y-%m-%d', validators=[Optional()])
    end_time = TimeField('終了時間', format='%H:%M', validators=[Optional()])
    is_all_day = BooleanField('終日予約')
    title = StringField('予約タイトル', validators=[DataRequired()])
    submit = SubmitField('予約する')

    # バリデーションの追加
    def validate_end_date(form, field):
        if form.is_all_day.data and field.data:
            raise ValidationError('終日予約の場合、終了日は指定不要です。')

    def validate_end_time(form, field):
        if form.is_all_day.data and field.data:
            raise ValidationError('終日予約の場合、終了時間は指定不要です。')

class LogoutForm(FlaskForm):
    submit = SubmitField('ログアウト')

class SettingsForm(FlaskForm):
    username = StringField('New Username')
    new_password = PasswordField('New Password')
    current_password = PasswordField('Current Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password')
    icon = FileField('Upload Icon')
    dark_mode = BooleanField('Dark Mode')
    submit = SubmitField('Save Changes')

class LocationForm(FlaskForm):
    location_name = StringField('教室名', validators=[DataRequired()])
    floor = SelectField('階数', choices=[(str(i), str(i)) for i in range(1, 11)])
    submit = SubmitField('Submit')

class AdminForm(FlaskForm):
    email = StringField('メールアドレス', validators=[DataRequired(), Email()])
    username = StringField('ユーザー名', validators=[DataRequired()])
    submit = SubmitField('管理者の追加')


# サーバーサイドでのログインユーザー情報の取得
def get_current_user_info():
    if current_user.is_authenticated:
        return {
            'user_id': current_user.id,
            'username': current_user.username
            # 他に必要な情報があれば追加
        }
    else:
        return None

# クライアントにログインユーザー情報を提供するエンドポイント
@app.route('/get_user_info', methods=['GET'])
def get_user_info():
    user_info = get_current_user_info()
    return jsonify(user_info)

# Login & Register other
@login_manager.user_loader
def load_user(user_id):
    return db.session.query(User).get(int(user_id))

# ログインしていない場合はログインページにリダイレクト
@app.before_request
def before_request():
    if not current_user.is_authenticated and request.endpoint not in ['login', 'register', 'static']:
        flash('ログインが必要です。', 'danger')
        return redirect(url_for('login'))

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if request.method == 'POST' and form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        user = User.query.filter_by(email=email).first()

        logging.debug(f'Attempting to log in user: {email}')

        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('ログインに成功しました。', 'success')
            logging.debug('Login successful')
            return redirect(url_for('index'))
        else:
            flash('ユーザー名またはパスワードが正しくありません。', 'danger')
            logging.warning('Login failed: Invalid username or password')
    return render_template('login.html', form=form)

# Register
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']
        password_confirm = request.form['password_confirm']

        # パスワードが一致するかの確認
        if password != password_confirm:
            flash('パスワードとパスワード確認が一致しません', 'danger')
            return redirect(url_for('register'))

        # ユーザー名とメールアドレスが使われていないか確認
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            flash('ユーザー名またはメールアドレスはすでに存在します。別のものを選択してください。', 'danger')
            return redirect(url_for('register'))

        # ドメインの取得
        domain = email.split('@')[-1] if '@' in email else None

        # 'pbkdf2_sha256' を使用してパスワードをハッシュ化
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # ユーザーの作成
        new_user = User(email=email, username=username, password=hashed_password, domain=domain)

        # データベースに追加
        db.session.add(new_user)
        db.session.commit()

        # 新しいユーザーでログイン
        login_user(new_user)

        # indexにリダイレクト
        return redirect('/')

    return render_template('register.html')



# Logout
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# index
@app.route('/')
@login_required
def index():
    login_status = None
    logout_form = LogoutForm()  # LogoutForm をインスタンス化

    # ログインに成功した場合、メッセージを設定
    if current_user.is_authenticated:
        login_status = 'ログインに成功しました。'

    # ログアウトボタンがクリックされた場合
    if logout_form.validate_on_submit():
        logout_user()
        return redirect(url_for('index'))

    return render_template('index.html', buttons=buttons_data, login_status=login_status, logout_form=logout_form)


# Location
@app.route('/add_location', methods=['GET', 'POST'])
@login_required
def add_location():
    # ロケーション登録ページ

    # アクセス権限の確認
    if not current_user.is_admin:
        flash('このページにアクセスする権限がありません。', 'danger')
        return redirect(url_for('index'))

    form = LocationForm()

    if form.validate_on_submit():
        # フォームからデータを取得してデータベースに追加
        location_name = form.location_name.data
        floor = form.floor.data

        # ユーザーのメールアドレスからドメインを抽出
        user_domain = current_user.email.split('@')[-1] if '@' in current_user.email else None

        # ドメインごとに既存のロケーションを確認
        existing_location = Location.query.filter_by(domain=user_domain, location_name=location_name, floor=floor).first()

        if existing_location:
            flash('同じドメイン、同じ階に既に存在するロケーション名です。別の名前または階を使用してください。', 'danger')
        else:
            new_location = Location(location_name=location_name, domain=user_domain, floor=floor)
            db.session.add(new_location)

            try:
                db.session.commit()
                flash('ロケーションが正常に追加されました。', 'success')
                
                # データベースの変更をコミットした後、show_locations ページにリダイレクト
                return redirect(url_for('show_locations'))
            except SQLAlchemyError as e:
                db.session.rollback()
                flash(f'データベースのエラーが発生しました: {str(e)}', 'danger')
            finally:
                db.session.close()

    return render_template('add_location.html', form=form)

@app.route('/locations')
@login_required
def show_locations():
    # ロケーション表示ページ

    # ユーザーのメールアドレスからドメインを取得
    user_domain = current_user.email.split('@')[-1] if '@' in current_user.email else None

    # データベースから対応するドメインのロケーション情報を取得
    if user_domain:
        locations = Location.query.filter_by(domain=user_domain).order_by(Location.floor, Location.location_name).all()
    else:
        locations = []

    # グループ化された辞書を作成（キーは階層）
    grouped_locations = {floor: list(group) for floor, group in groupby(locations, key=attrgetter('floor'))}

    return render_template('pages.html', grouped_locations=grouped_locations)

@app.route('/api/location_reservations/<int:location_id>')
def get_location_reservations(location_id):
    # Location API
    try:
        # location_idに基づいてロケーションを取得
        location = db.session.get(Location, location_id)


        if not location:
            app.logger.error(f'ロケーションが見つかりません: {location_id}')
            return jsonify({'error': 'ロケーションが見つかりません'}), 404

        # ロケーションに関連する予約データを取得し、ユーザードメインで絞り込む
        reservations = Reservation.query.filter_by(location_id=location_id, domain=current_user.email.split('@')[-1]).all()

        # 予約データをJSON形式に変換
        reservations_data = []
        for reservation in reservations:
            reservation_data = {
                'title': reservation.title,
                'start': reservation.start.isoformat(),
                'end': reservation.end.isoformat(),
            }
            reservations_data.append(reservation_data)

        return jsonify(reservations_data)
    except Exception as e:
        # エラーが発生した場合はログにエラーメッセージを出力
        app.logger.error(f'get_location_reservationsでエラーが発生しました: {str(e)}')
        return jsonify([]), 500
 
def get_location_attributes(location_name):
    # Location 属性を取得
    location = Location.query.filter_by(location_name=location_name, domain=current_user.email.split('@')[-1]).first()
    return {'id': location.id, 'location_name': location.location_name} if location else None


@app.route('/location/<location_name>', methods=['GET', 'POST'])
@login_required
def location_page(location_name):
    # Location Page
    
    # 指定された location_name の Location 属性を取得し、"g" に保存
    g.location_attributes = get_location_attributes(location_name)
    
    # Location が見つからない場合は、404 エラーを表示
    if not g.location_attributes:
        abort(404)

    # Location インスタンスを取得
    location = Location.query.filter_by(location_name=location_name, domain=current_user.email.split('@')[-1]).first()

    # reservation_id の Reservation インスタンスを取得
    reservation_id = request.args.get('desired_reservation_id', type=int)
    g.reservation = db.session.get(Reservation, reservation_id)

    # ロケーションに関連する予約を取得
    reservations = Reservation.query.filter_by(location_id=g.location_attributes['id'], domain=current_user.email.split('@')[-1]).all()

    # ReservationForm をインスタンス化
    form = ReservationForm()

     # ユーザーが予約を編集する権限があるか確認
    can_access = can_access_reservation(g.reservation, current_user)

    # 新しい予約を追加
    if form.validate_on_submit():
        start_date = form.start_date.data
        start_time = form.start_time.data
        
        # 終日予約の場合、終了日時を開始日時の23:59に設定
        if form.is_all_day.data:
            end_date = form.start_date.data
            end_time = time(23, 59)
        else:
            end_date = form.end_date.data
            end_time = form.end_time.data

        # 時間が選択されている場合のみdatetime.combine()を使用
        if start_time is not None:
            start_datetime = datetime.combine(start_date, start_time)
        else:
            start_datetime = datetime.combine(start_date, time.min)

        if end_time is not None:
            end_datetime = datetime.combine(end_date, end_time)
        else:
            end_datetime = datetime.combine(end_date, time.min)

        # 予約が有効かどうかを確認
        if start_date < date.today() or (not form.is_all_day.data and (start_datetime.hour < 7 or end_datetime.hour > 20)):
            flash('予約の詳細が無効です。', 'danger')
        else:
            # 既存の予約との重複を確認
            overlapping_reservations = Reservation.query.filter(
                (Reservation.location_id == g.location_attributes['id']) &
                (Reservation.id != reservation_id) &
                (
                    (Reservation.start <= start_datetime) & (Reservation.end > start_datetime) |
                    (Reservation.start < end_datetime) & (Reservation.end >= end_datetime) |
                    (Reservation.start >= start_datetime) & (Reservation.end <= end_datetime)
                )
            ).all()

            if overlapping_reservations:
                flash('指定された時間帯には既に予約があります。', 'danger')
            else:
                try:
                    # 新しい Reservation オブジェクトを作成
                    new_reservation = Reservation(
                        location_id=g.location_attributes['id'],
                        title=form.title.data,
                        start=start_datetime,
                        end=end_datetime,
                        user_id=current_user.id,
                        responsible_user=current_user.username,
                        domain=current_user.email.split('@')[-1]
                    )

                    # 新しい予約データをデータベースセッションに追加
                    db.session.add(new_reservation)
                    db.session.commit()

                    flash('予約が追加されました。', 'success')
                    return redirect(url_for('location_page', location_name=location_name))
                except SQLAlchemyError as e:
                    # エラーの処理
                    db.session.rollback()
                    flash(f'予約の追加中にエラーが発生しました: {str(e)}', 'danger')
                finally:
                    # セッションを閉じる
                    db.session.close()

    # テンプレートをレンダリングし、"g" に保存されたデータを使用
    return render_template('location_page.html', location=g.location_attributes, form=form, desired_reservation_id=reservation_id, reservations=reservations, can_access_reservation=can_access_reservation, current_datetime=datetime.now())



# Reservation
@app.route('/reservation')
@login_required
def show_pages():
    # ユーザーのメールアドレスからドメインを取得
    user_domain = current_user.email.split('@')[-1] if '@' in current_user.email else None

    # データベースから対応するドメインのロケーション情報を取得
    if user_domain:
        locations = Location.query.filter_by(domain=user_domain).order_by(Location.floor, Location.location_name).all()
    else:
        locations = []

    # グループ化された辞書を作成（キーは階層）
    grouped_locations = {floor: list(group) for floor, group in groupby(locations, key=attrgetter('floor'))}

    return render_template('pages.html', grouped_locations=grouped_locations)

def can_access_reservation(reservation, user):
    # 予約したユーザーまたは管理者であるかを確認
    return user.is_admin or (reservation and reservation.user_id == user.id)

# 予約変更ページ
@app.route('/location/<location_name>/edit_reservation/<int:reservation_id>', methods=['GET', 'POST'])
@login_required
def edit_reservation(location_name, reservation_id):
    location = Location.query.filter_by(location_name=location_name, domain=current_user.email.split('@')[-1]).first()

    if not location:
        abort(404)

    reservation = db.session.get(Reservation, reservation_id)

    if not reservation or reservation.location_id != location.id:
        abort(404)

    if not can_access_reservation(reservation, current_user):
        abort(403)

    # 既存の予約データをフォームに渡して初期化
    form = ReservationForm(obj=reservation)

    if form.validate_on_submit():
        # Check if start_time is not None before creating datetime
        if form.start_time.data is not None:
            start_datetime = datetime.combine(form.start_date.data, form.start_time.data)
        else:
            flash('開始時刻が無効です。', 'danger')
            return render_template('edit_reservation.html', location=location, form=form, reservation=reservation)

        if form.is_all_day.data:
            # 終日予約の場合、開始時間を0時、終了時間を23:59に設定
            start_datetime = datetime.combine(form.start_date.data, time.min)
            end_datetime = datetime.combine(form.start_date.data, time.max)
        else:
            # Check if end_time is not None before creating datetime
            if form.end_time.data is not None:
                end_datetime = datetime.combine(form.end_date.data, form.end_time.data)
            else:
                flash('終了時刻が無効です。', 'danger')
                return render_template('edit_reservation.html', location=location, form=form, reservation=reservation)

        if form.start_date.data < date.today() or (not form.is_all_day.data and (start_datetime.hour < 7 or end_datetime.hour > 20)):
            flash('予約の詳細が無効です。', 'danger')
        else:
            try:
                reservation.title = form.title.data
                reservation.start_datetime = start_datetime

                if form.is_all_day.data:
                    # 終日予約の場合、開始時間を0時、終了時間を23:59に設定
                    reservation.end_datetime = datetime.combine(form.start_date.data, datetime.max.time())
                else:
                    reservation.end_datetime = end_datetime

                db.session.commit()

                flash('予約が更新されました。', 'success')
                return redirect(url_for('location_page', location_name=location_name))
            except SQLAlchemyError as e:
                db.session.rollback()
                flash(f'予約の更新中にエラーが発生しました: {str(e)}', 'danger')
                raise
            finally:
                db.session.close()

    return render_template('edit_reservation.html', location=location, form=form, reservation=reservation)



# 予約の削除エンドポイント
@app.route('/location/<location_name>/delete_reservation/<int:reservation_id>', methods=['POST'])
@login_required
def delete_reservation(location_name, reservation_id):
    # データベースから指定された location_name の Location を取得
    location = Location.query.filter_by(location_name=location_name, domain=current_user.email.split('@')[-1]).first()

    # Location が存在しない場合は 404 エラーを表示
    if not location:
        abort(404)

    # データベースから指定された reservation_id の Reservation を取得
    reservation = db.session.get(Reservation, reservation_id)

    # Reservation が存在しない場合は 404 エラーを表示
    if not reservation or reservation.location_id != location.id:
        abort(404)

    # 予約が削除可能な権限があるか確認
    if not can_access_reservation(reservation, current_user):
        abort(403)

    try:
        # 予約を削除
        db.session.delete(reservation)

        # データベースの変更をコミット
        db.session.commit()

        flash('予約が削除されました。', 'success')
    except SQLAlchemyError as e:
        # エラーの処理
        db.session.rollback()
        flash(f'予約の削除中にエラーが発生しました: {str(e)}', 'danger')
    finally:
        # セッションを閉じる
        db.session.close()

    return redirect(url_for('location_page', location_name=location_name))

@app.route('/update_reservation_time', methods=['POST'])
def update_reservation_time():
    event_id = request.form.get('eventId')
    new_start = request.form.get('newStart')
    new_end = request.form.get('newEnd')

    # データベースで対応する予約を取得
    reservation = Reservation.query.get(event_id)

    if reservation:
        # 予約が見つかった場合、日時を更新
        reservation.start_datetime = new_start
        reservation.end_datetime = new_end

        # 予約を保存
        db.session.commit()

        return jsonify({'message': '予約が更新されました。'})
    else:
        return jsonify({'message': '対応する予約が見つかりませんでした。'}), 404



# Map
@app.route('/map')
@login_required
def map():
    return render_template('map.html')



# Settings
@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    form = SettingsForm()

    if request.method == 'POST' and form.validate_on_submit():
        current_password = form.current_password.data
        new_password = form.new_password.data
        confirm_password = form.confirm_password.data
        username = form.username.data

        # 現在のパスワードの確認
        if not check_password_hash(current_user.password, current_password):
            # 現在のパスワードが間違っている場合の処理
            error_message = 'パスワードが間違っています'
            flash(error_message, 'danger') 
            return render_template('settings.html', form=form, error=error_message)

        # 新しいパスワードと確認が一致するかチェックする
        if new_password != confirm_password:
            # パスワードが不一致の場合
            error_message = '新しいパスワードと確認パスワードが一致しません'
            flash(error_message, 'danger') 
            return render_template('settings.html', form=form, error=error_message)

        # ユーザー名の更新
        if username:  # 新しいユーザー名が提供された場合のみ更新
            current_user.username = username

        # 新しいパスワードが提供された場合、パスワードを更新する
        if new_password:
            current_user.password = generate_password_hash(new_password, method='pbkdf2:sha256')

        db.session.commit()

        flash('設定が正常に更新されました', 'success')
        return redirect(url_for('settings'))

    return render_template('settings.html', form=form)

# Admin
@app.route('/add_admin', methods=['GET', 'POST'])
def add_admin():
    if not current_user.is_admin:
        flash('このページにアクセスする権限がありません。', 'danger')
        return redirect(url_for('index'))

    form = AdminForm()

    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data

        existing_admin = User.query.filter_by(username=username, email=email).first()

        if existing_admin:
            if not existing_admin.is_admin:
                existing_admin.is_admin = True
                try:
                    # データベースの更新処理
                    db.session.commit()
                    flash('ユーザーが正常に管理者に昇格しました！', 'success')
                    print('リダイレクト前')
                    return redirect(url_for('index'))
                except SQLAlchemyError as e:
                    db.session.rollback()
                    flash(f'データベースのエラーが発生しました: {str(e)}', 'danger')
                finally:
                    db.session.close()
            else:
                flash('ユーザーは既に管理者権限を持っています。', 'warning')
        else:
            flash('ユーザー名とメールアドレスが一致しません。', 'danger')

    return render_template('add_admin.html', form=form)

# Contact
@app.route('/contact', methods=['GET'])
@login_required
def contact():
    form = StartConversationForm()

    current_user_domain = current_user.email.split('@')[-1]

    # 同じドメインに属するユーザーのリストを取得
    users_in_domain = User.query.filter_by(domain=current_user_domain).all()

    # リストから現在のユーザーを除外
    other_users = [user for user in users_in_domain if user.id != current_user.id]

    # ユーザーの会話を取得
    conversations = Conversation.query.filter(
        ((Conversation.user1_id == current_user.id) | (Conversation.user2_id == current_user.id)) &
        (Conversation.user2_id.in_([user.id for user in other_users]) | Conversation.user1_id.in_([user.id for user in other_users]))
    ).all()

    # Provide a default selected_user for the form
    selected_user = other_users[0] if other_users else None

    # ここで selectedUserId を定義
    selectedUserId = selected_user.id if selected_user else None

    return render_template('contact_list.html', conversations=conversations, form=form, selected_user=selected_user, selectedUserId=selectedUserId)

@app.route('/contact/<int:other_user_id>', methods=['GET', 'POST'])
@login_required
def view_contact(other_user_id):
    # ユーザーとの会話を取得
    conversation = Conversation.query.filter(
        ((Conversation.user1_id == current_user.id) & (Conversation.user2_id == other_user_id)) |
        ((Conversation.user2_id == current_user.id) & (Conversation.user1_id == other_user_id))
    ).first()

    # 会話が存在しない場合、新しい会話を開始
    if not conversation:
        return redirect(url_for('start_new_conversation', other_user_id=other_user_id))

    if request.method == 'POST':
        # 新しいメッセージを作成してデータベースに追加
        content = request.form.get('message_content')
        new_message = Message(sender_id=current_user.id, recipient_id=other_user_id, content=content)
        conversation.messages.append(new_message)
        db.session.commit()

        # メッセージ受信者に通知を送る
        recipient_user = User.query.get(other_user_id)
        notify_message_received(recipient_user, current_user, content)


    # ここで selectedUserId を定義
    selectedUserId = other_user_id

    return render_template('view_contact.html', conversation=conversation, other_user_id=other_user_id, selectedUserId=selectedUserId)

def notify_message_received(recipient_user, sender_user, message_content):
    # 通知の保存などの処理を実行
    new_notification = Notification(
        user_id=recipient_user.id,
        content=f'新しいメッセージがあります: {sender_user.username} から - "{message_content}"',
        is_read=False  # 未読状態で保存
    )
    db.session.add(new_notification)
    db.session.commit()

# 新しい会話を開始するエンドポイント
@app.route('/start_new_conversation/<int:other_user_id>', methods=['POST'])
@login_required
def start_new_conversation(other_user_id):
    # 同じドメインに属するユーザーのリストを取得
    users_in_domain = User.query.filter_by(domain=current_user.email.split('@')[-1]).all()

    # リストから現在のユーザーを除外
    other_users = [user for user in users_in_domain if user.id != current_user.id]

    # 選択されたユーザーとの会話を開始
    selected_user = User.query.get(other_user_id)

    if selected_user is None:
        # ユーザーが存在しない場合の処理を追加
        flash('指定されたユーザーが見つかりませんでした', 'danger')
        return redirect(url_for('contact'))  # トーク画面にリダイレクト

    # 以下の処理に移る前に selected_user が None でないことを確認
    if current_user.id == selected_user.id:
        # 同じユーザーとは会話を開始できないようにするなどの処理を追加
        flash('自分自身とは会話を開始できません', 'danger')
        return redirect(url_for('contact'))  # トーク画面にリダイレクト
    
    # 会話が既に存在するか確認
    existing_conversation = Conversation.query.filter(
        ((Conversation.user1_id == current_user.id) & (Conversation.user2_id == selected_user.id)) |
        ((Conversation.user2_id == current_user.id) & (Conversation.user1_id == selected_user.id))
    ).first()

    if not existing_conversation:
        # 新しい会話を作成
        new_conversation = Conversation(user1_id=current_user.id, user2_id=selected_user.id)
        db.session.add(new_conversation)
        db.session.commit()

        # 作成した会話のIDを取得
        conversation_id = new_conversation.id

        # 会話ページにリダイレクト
        return redirect(url_for('view_contact', other_user_id=selected_user.id, conversation_id=conversation_id, selectedUserId=other_user_id))

    # 会話ページにリダイレクト
    return redirect(url_for('view_contact', other_user_id=selected_user.id, conversation_id=existing_conversation.id, selectedUserId=other_user_id))

@app.route('/send_message/<int:other_user_id>', methods=['POST'])
def send_message(other_user_id):
    # リクエストからメッセージの内容を取得
    message_content = request.form.get('message_content')

    # 必要ならバリデーションや処理を実行

    # 他のユーザーとの会話を取得
    conversation = Conversation.query.filter(
        (Conversation.user1_id == current_user.id) & (Conversation.user2_id == other_user_id) |
        (Conversation.user1_id == other_user_id) & (Conversation.user2_id == current_user.id)
    ).first()

    if not conversation:
        # 会話が存在しない場合の処理を追加
        flash('会話が見つかりませんでした', 'error')
        return redirect(url_for('contact'))  # トーク画面にリダイレクト

    # 簡単のため、Messageモデルを仮定しています
    new_message = Message(
        conversation=conversation,
        sender_id=current_user.id,
        recipient_id=other_user_id,
        content=message_content
    )

    db.session.add(new_message)
    db.session.commit()

    flash('メッセージが正常に送信されました', 'success')
    return redirect(url_for('view_contact', other_user_id=other_user_id))  # トーク画面にリダイレクト

@app.route('/delete_message/<int:message_id>', methods=['POST'])
def delete_message(message_id):
    # メッセージをデータベースから取得
    message = Message.query.get(message_id)

    # メッセージが存在しない場合の処理
    if not message:
        return jsonify({'success': False, 'message': 'メッセージが見つかりませんでした'})

    # メッセージの送信者が現在のユーザーであるか確認
    if message.sender_id != current_user.id:
        return jsonify({'success': False, 'message': 'メッセージを削除する権限がありません'})

    # メッセージを削除
    db.session.delete(message)
    db.session.commit()

    return jsonify({'success': True, 'message': 'メッセージが正常に削除されました'})

@app.route('/get_same_domain_users', methods=['POST'])
def get_same_domain_users():
    # データベースから同ドメインのユーザーを取得する処理（実際のコードに合わせて変更してください）
    same_domain_users = User.query.filter_by(domain=current_user.domain).all()
    # JSON形式に変換して返す
    return jsonify({'same_domain_users': [{'id': user.id, 'username': user.username} for user in same_domain_users]})



# 位置情報
@app.route('/save_location', methods=['POST'])
@login_required
def save_location():
    user_id = current_user.get_id()
    latitude = request.json.get('latitude')
    longitude = request.json.get('longitude')

    if user_id is not None and latitude is not None and longitude is not None:
        # 既存の位置情報を取得
        existing_location = UserLocation.query.filter_by(user_id=user_id).first()

        if existing_location:
            # 既存の位置情報が存在する場合は更新
            existing_location.latitude = latitude
            existing_location.longitude = longitude
            db.session.commit()
            return jsonify({'message': 'Location updated successfully'}), 200
        else:
            # 既存の位置情報が存在しない場合は新しい位置情報を挿入
            new_location = UserLocation(user_id=user_id, latitude=latitude, longitude=longitude)
            db.session.add(new_location)
            db.session.commit()
            return jsonify({'message': 'Location saved successfully'}), 200
    else:
        return jsonify({'message': 'Invalid data'}), 400

# マップに表示するユーザーロケーションデータを提供するエンドポイント
@app.route('/get_user_locations')
def get_user_locations():
    if current_user.is_authenticated:
        user_locations = UserLocation.query.all()
        locations = []

        for loc in user_locations:
            user = User.query.get(loc.user_id)
            if user:
                locations.append({'id': loc.id, 'name': user.username, 'lat': loc.latitude, 'lng': loc.longitude, 'user_id': user.id})

        return jsonify(locations)
    else:
        return jsonify({'message': 'Not logged in'}), 401

@app.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()  # データベースから全てのユーザーを取得する例
    user_list = [{'id': user.id, 'username': user.username} for user in users]
    return jsonify({'users': user_list})


def initialize_user_locations():
    try:
        # 既存のユーザーロケーションを全て削除する
        db.session.query(UserLocation).delete()
        db.session.commit()

        # または、特定の初期値で全てのユーザーロケーションを更新する
        # 例: UserLocation.query.update({UserLocation.latitude: 0, UserLocation.longitude: 0})
        # db.session.commit()

        print('User locations initialized successfully.')

    except Exception as e:
        db.session.rollback()
        print(f'Error initializing user locations: {str(e)}')

@scheduler.task('interval', id='initialize_job', seconds=20)  # 2分ごとに実行
def scheduled_job():
    with app.app_context():
        initialize_user_locations()

# データベースの初期化
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    scheduler.init_app(app)
    scheduler.start()
    app.run(host='0.0.0.0', debug=True)
