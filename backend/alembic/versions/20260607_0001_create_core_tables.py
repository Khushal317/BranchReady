"""create core tables

Revision ID: 20260607_0001
Revises:
Create Date: 2026-06-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260607_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "banks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bank_name", sa.String(length=200), nullable=False),
        sa.Column("bank_type", sa.String(length=80), nullable=True),
        sa.Column("country", sa.String(length=80), nullable=False),
        sa.Column("website", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("bank_name"),
    )
    op.create_index(op.f("ix_banks_bank_name"), "banks", ["bank_name"], unique=False)
    op.create_index(op.f("ix_banks_id"), "banks", ["id"], unique=False)

    op.create_table(
        "contributors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("role", sa.String(length=120), nullable=True),
        sa.Column("bank", sa.String(length=200), nullable=True),
        sa.Column("branch_city", sa.String(length=200), nullable=True),
        sa.Column("contact", sa.String(length=200), nullable=True),
        sa.Column("contribution_count", sa.Integer(), nullable=False),
        sa.Column("payment_status", sa.String(length=80), nullable=True),
        sa.Column("trust_score", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contributors_id"), "contributors", ["id"], unique=False)

    op.create_table(
        "processes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bank_id", sa.Integer(), nullable=False),
        sa.Column("process_name", sa.String(length=200), nullable=False),
        sa.Column("process_category", sa.String(length=120), nullable=True),
        sa.Column("customer_friendly_title", sa.String(length=250), nullable=False),
        sa.Column("employee_friendly_title", sa.String(length=250), nullable=True),
        sa.Column("required_documents", sa.Text(), nullable=False),
        sa.Column("optional_documents", sa.Text(), nullable=True),
        sa.Column("form_name", sa.String(length=250), nullable=True),
        sa.Column("form_link", sa.String(length=500), nullable=True),
        sa.Column("originals_required", sa.String(length=40), nullable=False),
        sa.Column("photocopies_required", sa.String(length=40), nullable=False),
        sa.Column("self_attestation_required", sa.String(length=40), nullable=False),
        sa.Column("branch_visit_required", sa.Boolean(), nullable=False),
        sa.Column("online_possible", sa.Boolean(), nullable=False),
        sa.Column("estimated_time", sa.String(length=250), nullable=True),
        sa.Column("customer_steps", sa.Text(), nullable=False),
        sa.Column("employee_steps", sa.Text(), nullable=True),
        sa.Column("common_rejection_reasons", sa.Text(), nullable=True),
        sa.Column("escalation_required", sa.Text(), nullable=True),
        sa.Column("last_verified_date", sa.Date(), nullable=True),
        sa.Column("verified_by", sa.String(length=200), nullable=True),
        sa.Column("source_type", sa.String(length=120), nullable=True),
        sa.Column("confidence_status", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("public_notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["bank_id"], ["banks.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_processes_bank_id"), "processes", ["bank_id"], unique=False)
    op.create_index(op.f("ix_processes_id"), "processes", ["id"], unique=False)
    op.create_index(
        op.f("ix_processes_process_name"),
        "processes",
        ["process_name"],
        unique=False,
    )

    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("bank_id", sa.Integer(), nullable=True),
        sa.Column("process_id", sa.Integer(), nullable=True),
        sa.Column("feedback_type", sa.String(length=120), nullable=False),
        sa.Column("user_feedback", sa.Text(), nullable=False),
        sa.Column("suggested_correction", sa.Text(), nullable=True),
        sa.Column("contact", sa.String(length=200), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["bank_id"], ["banks.id"]),
        sa.ForeignKeyConstraint(["process_id"], ["processes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_feedback_id"), "feedback", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_feedback_id"), table_name="feedback")
    op.drop_table("feedback")
    op.drop_index(op.f("ix_processes_process_name"), table_name="processes")
    op.drop_index(op.f("ix_processes_id"), table_name="processes")
    op.drop_index(op.f("ix_processes_bank_id"), table_name="processes")
    op.drop_table("processes")
    op.drop_index(op.f("ix_contributors_id"), table_name="contributors")
    op.drop_table("contributors")
    op.drop_index(op.f("ix_banks_id"), table_name="banks")
    op.drop_index(op.f("ix_banks_bank_name"), table_name="banks")
    op.drop_table("banks")
