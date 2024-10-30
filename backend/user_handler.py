from flask import Blueprint, request, jsonify
from backend.models.user_model import User
from backend.models.database import db
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai

user_bp = Blueprint('user', __name__)

@user_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_user_settings():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'preferred_model': user.preferred_model,
        'openai_api_key': user.openai_api_key
    }), 200

@user_bp.route('/settings', methods=['POST'])
@jwt_required()
def update_user_settings():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    if 'preferred_model' in data:
        user.preferred_model = data['preferred_model']
    if 'openai_api_key' in data:
        user.openai_api_key = data['openai_api_key']
    
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully'}), 200

@user_bp.route('/validate-api-key', methods=['POST'])
@jwt_required()
def validate_api_key():
    data = request.json
    api_key = data.get('api_key')
    
    if not api_key:
        return jsonify({'valid': False}), 400

    try:
        client = openai.OpenAI(api_key=api_key)
        client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=5
        )
        return jsonify({'valid': True}), 200
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 200 