from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_default_prompts'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Insert default prompts for translation handler and editor handler
    op.execute("""
        INSERT INTO prompt (system_message, user_message, prompt_type, created_at, updated_at)
        VALUES
        ('Translate the given text into Bulgarian language.', 'Translate the text and dont be lazy, translate the whole given text.', 'translation', '{}', '{}'),
        ('Act as a proficient editor in Bulgarian language.', 'Please edit the text as needed and dont be lazy.', 'editing', '{}', '{}')
    """.format(datetime.utcnow(), datetime.utcnow(), datetime.utcnow(), datetime.utcnow()))

def downgrade():
    # Remove the default prompts
    op.execute("""
        DELETE FROM prompt WHERE system_message IN ('Translate the given text into Bulgarian language.', 'Act as a proficient editor in Bulgarian language.')
    """)
