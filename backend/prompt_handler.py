from flask import request, jsonify
from backend.models.prompt_model import db, Prompt

class PromptHandler:
    def create_prompt(self):
        data = request.get_json()
        new_prompt = Prompt(
            system_message=data['system_message'],
            user_message=data['user_message'],
            prompt_type=data['prompt_type']
        )
        db.session.add(new_prompt)
        db.session.commit()
        return jsonify({'message': 'Prompt created successfully'}), 201

    def get_prompts(self):
        page = request.args.get('page', 1, type=int)
        items_per_page = request.args.get('itemsPerPage', 5, type=int)
        offset = (page - 1) * items_per_page
        prompts = Prompt.query.limit(items_per_page).offset(offset).all()
        total = Prompt.query.count()
        return jsonify({
            'prompts': [{
                'id': prompt.id,
                'system_message': prompt.system_message,
                'user_message': prompt.user_message,
                'prompt_type': prompt.prompt_type,
                'created_at': prompt.created_at,
                'updated_at': prompt.updated_at
            } for prompt in prompts],
            'total': total
        }), 200

    def update_prompt(self, prompt_id):
        data = request.get_json()
        prompt = Prompt.query.get_or_404(prompt_id)
        prompt.system_message = data.get('system_message', prompt.system_message)
        prompt.user_message = data.get('user_message', prompt.user_message)
        prompt.prompt_type = data.get('prompt_type', prompt.prompt_type)
        db.session.commit()
        return jsonify({'message': 'Prompt updated successfully'}), 200

    def delete_prompt(self, prompt_id):
        prompt = Prompt.query.get_or_404(prompt_id)
        db.session.delete(prompt)
        db.session.commit()
        return jsonify({'message': 'Prompt deleted successfully'}), 200
