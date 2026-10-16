"""Initial database schema with users, customers, interactions, and ai_insights

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-16 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='viewer'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. Customers Table
    op.create_table(
        'customers',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('company', sa.String(length=200), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_by', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_customers_company'), 'customers', ['company'], unique=False)
    op.create_index(op.f('ix_customers_email'), 'customers', ['email'], unique=False)
    op.create_index(op.f('ix_customers_name'), 'customers', ['name'], unique=False)
    op.create_index(op.f('ix_customers_status'), 'customers', ['status'], unique=False)

    # 3. Interactions Table
    op.create_table(
        'interactions',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('customer_id', sa.String(length=36), sa.ForeignKey('customers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('type', sa.String(length=20), nullable=False, server_default='meeting'),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('notes', sa.Text(), nullable=False),
        sa.Column('interaction_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_interactions_customer_id'), 'interactions', ['customer_id'], unique=False)
    op.create_index(op.f('ix_interactions_created_by'), 'interactions', ['created_by'], unique=False)
    op.create_index(op.f('ix_interactions_type'), 'interactions', ['type'], unique=False)
    op.create_index(op.f('ix_interactions_interaction_date'), 'interactions', ['interaction_date'], unique=False)

    # 4. AI Insights Table
    op.create_table(
        'ai_insights',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('interaction_id', sa.String(length=36), sa.ForeignKey('interactions.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('sentiment', sa.String(length=20), nullable=False, server_default='neutral'),
        sa.Column('action_items', sa.JSON(), nullable=False),
        sa.Column('key_risks', sa.JSON(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f('ix_ai_insights_interaction_id'), 'ai_insights', ['interaction_id'], unique=True)
    op.create_index(op.f('ix_ai_insights_sentiment'), 'ai_insights', ['sentiment'], unique=False)


def downgrade() -> None:
    op.drop_table('ai_insights')
    op.drop_table('interactions')
    op.drop_table('customers')
    op.drop_table('users')

