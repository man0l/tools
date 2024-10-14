from flask import Blueprint, request, jsonify
from backend.models.prompt_model import db, Prompt

prompt_bp = Blueprint('prompt_bp', __name__)

@prompt_bp.route('/prompts', methods=['POST'])
def create_prompt():
    data = request.get_json()
    new_prompt = Prompt(
        system_message=data['system_message'],
        user_message=data['user_message'],
        prompt_type=data['prompt_type']
    )
    db.session.add(new_prompt)
    db.session.commit()
    return jsonify({'message': 'Prompt created successfully'}), 201

@prompt_bp.route('/prompts', methods=['GET'])
def get_prompts():
    prompts = Prompt.query.all()
    return jsonify([{
        'id': prompt.id,
        'system_message': prompt.system_message,
        'user_message': prompt.user_message,
        'prompt_type': prompt.prompt_type,
        'created_at': prompt.created_at,
        'updated_at': prompt.updated_at
    } for prompt in prompts]), 200

@prompt_bp.route('/prompts/<int:prompt_id>', methods=['PUT'])
def update_prompt(prompt_id):
    data = request.get_json()
    prompt = Prompt.query.get_or_404(prompt_id)
    prompt.system_message = data.get('system_message', prompt.system_message)
    prompt.user_message = data.get('user_message', prompt.user_message)
    prompt.prompt_type = data.get('prompt_type', prompt.prompt_type)
    db.session.commit()
    return jsonify({'message': 'Prompt updated successfully'}), 200

@prompt_bp.route('/prompts/<int:prompt_id>', methods=['DELETE'])
def delete_prompt(prompt_id):
    prompt = Prompt.query.get_or_404(prompt_id)
    db.session.delete(prompt)
    db.session.commit()
    return jsonify({'message': 'Prompt deleted successfully'}), 200
