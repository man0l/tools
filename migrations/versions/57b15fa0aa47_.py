"""empty message

Revision ID: 57b15fa0aa47
Revises: 71308d97ad4d
Create Date: 2024-10-30 07:29:39.074059

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '57b15fa0aa47'
down_revision = '71308d97ad4d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('preferred_model', sa.String(length=50), nullable=False, server_default='gpt-4o'))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('preferred_model')

    # ### end Alembic commands ###