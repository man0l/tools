"""Merge heads

Revision ID: 8727b29b3d3d
Revises: 08964c4a7c70, add_default_prompts
Create Date: 2024-10-14 11:15:22.257291

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8727b29b3d3d'
down_revision = ('08964c4a7c70', 'add_default_prompts')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
