from datetime import date

from app.api.routers.admin import (
    admin_login,
    create_process,
    update_feedback,
    update_process,
)
from app.api.routers.public import create_feedback, get_process_answer, list_banks
from app.core.config import settings
from app.db.session import SessionLocal
from app.schemas.auth import AdminLoginRequest
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate
from app.schemas.process import ProcessCreate, ProcessUpdate


def assert_ok(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def main() -> None:
    db = SessionLocal()
    try:
        login = admin_login(
            AdminLoginRequest(
                username=settings.admin_username,
                password=settings.admin_password,
            )
        )
        assert_ok(login.access_token == settings.admin_token, "admin login failed")

        banks = list_banks(db)
        union_bank = next(
            (
                bank
                for bank in banks
                if bank.bank_name == "Union Bank of India"
            ),
            None,
        )
        assert_ok(union_bank is not None, "Union Bank seed missing")
        bank_id = union_bank.id

        process_payload = ProcessCreate(
            bank_id=bank_id,
            process_name="Phase 9 verification process",
            process_category="verification",
            customer_friendly_title="Phase 9 Verification Process",
            employee_friendly_title="Phase 9 Verification Checklist",
            required_documents="Test document from stored data only.",
            optional_documents="No optional test documents.",
            form_name="Test form",
            form_link=None,
            originals_required="No",
            photocopies_required="No",
            self_attestation_required="No",
            branch_visit_required=True,
            online_possible=False,
            estimated_time="Test time only.",
            customer_steps="Read stored test step.",
            employee_steps="Verify stored test checklist.",
            common_rejection_reasons="No stored test rejection reason.",
            escalation_required="No test escalation.",
            last_verified_date=date.today(),
            verified_by="Phase 9 verifier",
            source_type="local verification",
            confidence_status="unverified",
            status="active",
            internal_notes="Temporary Phase 9 verification record.",
            public_notes="Temporary verification record.",
        )

        created = create_process(process_payload, db)
        process_id = created.id

        updated = update_process(
            process_id,
            ProcessUpdate(confidence_status="needs re-check"),
            db,
        )
        assert_ok(
            updated.confidence_status == "needs re-check",
            "admin process verification control failed",
        )

        customer_answer = get_process_answer(
            bank_id=bank_id,
            q="Phase 9 verification",
            db=db,
        )
        assert_ok(customer_answer.available is True, "stored answer not available")
        assert_ok(
            customer_answer.required_documents
            == process_payload.required_documents,
            "answer did not come from stored process data",
        )
        assert_ok(
            customer_answer.branch_variation_warning,
            "branch variation warning missing",
        )
        assert_ok(
            customer_answer.last_verified_date is not None,
            "verified date missing",
        )
        assert_ok(customer_answer.confidence_status, "confidence status missing")

        employee_answer = get_process_answer(
            bank_id=bank_id,
            q="Phase 9 Verification Checklist",
            db=db,
        )
        assert_ok(
            employee_answer.employee_steps == process_payload.employee_steps,
            "employee checklist did not come from stored data",
        )

        unavailable = get_process_answer(
            bank_id=bank_id,
            q="Definitely missing process",
            db=db,
        )
        assert_ok(
            unavailable.available is False,
            "missing process did not return unavailable",
        )
        assert_ok(
            unavailable.required_documents is None,
            "unavailable answer invented documents",
        )

        feedback = create_feedback(
            FeedbackCreate(
                bank_id=bank_id,
                process_id=process_id,
                feedback_type="information was correct",
                user_feedback="Phase 9 feedback verification.",
                suggested_correction=None,
                contact=None,
                status="new",
            ),
            db,
        )

        feedback_update = update_feedback(
            feedback.id,
            FeedbackUpdate(status="reviewed"),
            db,
        )
        assert_ok(
            feedback_update.status == "reviewed",
            "feedback status did not update",
        )

        deactivated = update_process(
            process_id,
            ProcessUpdate(status="inactive"),
            db,
        )
        assert_ok(deactivated.status == "inactive", "test process cleanup failed")
    finally:
        db.close()

    print("Phase 9 verification passed")


if __name__ == "__main__":
    main()
