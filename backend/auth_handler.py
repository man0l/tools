from flask import Blueprint, request, jsonify
from backend.models.user_model import User
from backend.models.database import db
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required.'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'Username or email already exists.'}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully.'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')  # Can be username or email
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required.'}), 400

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'userId': user.id
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials.'}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': access_token}), 200
