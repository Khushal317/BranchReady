# BranchReady MVP Implementation Plan

## Summary

BranchReady is a simple banking process guidance MVP. It helps customers and bank employees understand the documents, forms, steps, common mistakes, estimated time, and verification status for common branch banking tasks.

This product is not a bank, not a payment app, not a KYC approval system, and not connected to any real bank records. It only explains stored process guidance from our own knowledge database.

## Locked MVP Decisions

- Backend: FastAPI
- Frontend: React
- Database: PostgreSQL
- ORM and migrations: SQLAlchemy and Alembic
- Admin access: single configured admin username/password
- Initial bank scope: Union Bank only
- Initial product name: BranchReady
- Customer login: not included
- Bank integration: not included
- Document upload or verification: not included
- Payments, transfers, account operations, and approvals: not included

## Core Rule

BranchReady must answer only from stored database records.

If exact bank and process information is unavailable, the system must say that verified information is not available and recommend confirming with the branch. The system must not invent documents, forms, steps, timelines, or guarantees.

Every process answer must show:

- Last verified date
- Confidence status
- Branch-specific variation warning

## Phase 0: Planning Files And Repo Basics

Create only foundational repo files.

Files:

- `IMPLEMENTATION.md`
- `CHECKLIST.md`
- `.gitignore`
- `README.md`
- `backend/.gitkeep`
- `frontend/.gitkeep`

Boundaries:

- Do not install dependencies.
- Do not scaffold FastAPI.
- Do not scaffold React.
- Do not create database models.
- Do not create routes, UI pages, auth, or migrations.

## Phase 1: Backend Foundation

Set up the FastAPI backend with the minimum required base structure.

Planned work:

- FastAPI app entrypoint
- Health route: `GET /health`
- PostgreSQL configuration
- SQLAlchemy setup
- Alembic setup
- Pydantic schemas
- Basic error handling
- CORS for local React development

Planned database tables:

- `banks`
- `processes`
- `contributors`
- `feedback`

## Phase 2: Knowledge Database And Process APIs

Create the database-backed API layer for banks, processes, admin edits, and feedback.

Public APIs:

- `GET /api/banks`
- `GET /api/processes?bank_id=&q=`
- `GET /api/processes/{id}`
- `POST /api/feedback`

Admin APIs:

- `POST /api/admin/login`
- `GET /api/admin/processes`
- `POST /api/admin/processes`
- `PUT /api/admin/processes/{id}`
- `POST /api/admin/banks`
- `PUT /api/admin/banks/{id}`
- `GET /api/admin/feedback`
- `PUT /api/admin/feedback/{id}`

Seed data:

- Add Union Bank first.
- Add a small number of Union Bank processes first.
- Mark each process honestly as verified, needs re-check, or unverified.
- Do not add fake coverage for other banks.

## Phase 3: Strict Search And Answer Rules

Build the process matching layer.

Behavior:

- Match user input to stored bank and process records.
- Return stored data only when a matching record exists.
- Return an unavailable message when no exact information exists.
- Always include last verified date, confidence status, and branch variation warning.
- Never generate banking facts from AI.

AI may be added later only to map user language to a stored process. AI must never create documents, steps, or requirements.

## Phase 4: React Frontend Foundation

Set up the React frontend as a simple app.

Pages:

- Landing page
- Customer Assistant
- Employee Copilot
- Admin Login
- Admin Dashboard
- Feedback form

Frontend boundaries:

- Keep the UI simple and practical.
- Do not add customer login.
- Do not hardcode banking answers in the frontend.
- Do not add unnecessary animations, dashboards, or complex state tooling.

## Phase 5: Customer Assistant

Build the customer workflow.

Inputs:

- Select bank
- Select process
- Type a natural question

Output:

- Process title
- Required documents
- Optional documents
- Originals needed
- Photocopies needed
- Self-attestation needed
- Form required
- Branch steps
- Estimated time
- Common rejection reasons
- Last verified date
- Confidence status
- Branch variation warning
- Feedback action

Unavailable state:

- Show that verified information is not available for the exact bank/process.
- Recommend confirming with the branch before visiting.

## Phase 6: Employee Copilot

Build the employee workflow.

Inputs:

- Select bank
- Search process
- Ask short internal question

Output:

- Quick checklist
- Documents to verify
- What to ask the customer
- What form to give
- Employee steps
- Escalation note
- Copyable customer explanation
- Last verified date
- Confidence status

Privacy rule:

- Do not publicly expose contributor identities or private contact details.

## Phase 7: Admin Dashboard

Build the protected admin dashboard.

Admin can:

- Add bank
- Edit bank
- Add process
- Edit process
- Activate or deactivate process
- Mark process as verified, needs re-check, or unverified
- Update last verified date
- Review feedback
- Mark feedback as reviewed, fixed, rejected, or new

Auth:

- Use one configured admin username/password.
- Do not build registration or multi-user account management.

## Phase 8: Feedback System

Build public feedback collection and admin review.

Feedback types:

- Information was correct
- Information was wrong
- Branch asked for extra document
- Process is outdated
- Missing process request

Feedback fields:

- Bank
- Process
- Feedback type
- Feedback message
- Suggested correction
- Optional contact
- Status
- Created date

## Phase 9: Verification And Hardening

Verify the MVP end to end.

Checks:

- Backend health route works.
- Database migrations run cleanly.
- Seed data loads.
- Customer search returns stored Union Bank process data.
- Unknown bank/process returns unavailable message.
- Employee copilot shows internal checklist from stored data.
- Admin login protects admin tools.
- Admin can add and edit a process.
- Feedback can be submitted and reviewed.
- No AI-created banking facts appear in responses.

## Phase 10: Deployment Preparation

Prepare for simple deployment.

Add:

- `.env.example`
- Setup instructions
- Migration instructions
- Seed command instructions
- Production CORS configuration notes
- PostgreSQL environment variable documentation

Possible future hosting targets:

- Render
- Railway
- Fly.io
- VPS

The hosting target will be decided later.
