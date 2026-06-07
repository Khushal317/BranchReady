# BranchReady MVP Checklist

## Phase 0: Planning Files And Repo Basics

- [x] Create `IMPLEMENTATION.md`
- [x] Create `CHECKLIST.md`
- [x] Create `.gitignore`
- [x] Create minimal `README.md`
- [x] Create `backend/` placeholder
- [x] Create `frontend/` placeholder
- [x] Confirm no app code or extra features were added

## Phase 1: Backend Foundation

- [x] Create FastAPI backend structure
- [x] Add health route
- [x] Add PostgreSQL configuration
- [x] Add SQLAlchemy setup
- [x] Add Alembic setup
- [x] Add Pydantic schemas
- [x] Add basic error handling
- [x] Add local React CORS configuration

## Phase 2: Knowledge Database And Process APIs

- [x] Create bank APIs
- [x] Create process APIs
- [x] Create feedback API
- [x] Create admin login API
- [x] Create admin bank APIs
- [x] Create admin process APIs
- [x] Create admin feedback APIs
- [x] Add Union Bank seed data

## Phase 3: Strict Search And Answer Rules

- [x] Add stored-data-only matching behavior
- [x] Add unavailable response for missing process data
- [x] Always return last verified date
- [x] Always return confidence status
- [x] Always return branch variation warning
- [x] Prevent invented banking facts

## Phase 4: React Frontend Foundation

- [x] Create React frontend structure
- [x] Add app routing
- [x] Add API client
- [x] Add basic layout
- [x] Add landing page shell
- [x] Add customer assistant shell
- [x] Add employee copilot shell
- [x] Add admin shell
- [x] Add feedback shell

## Phase 5: Customer Assistant

- [x] Add bank selection
- [x] Add process selection
- [x] Add natural question input
- [x] Show process answer from backend
- [x] Show unavailable state
- [x] Add feedback action

## Phase 6: Employee Copilot

- [x] Add bank selection
- [x] Add process search
- [x] Show employee checklist
- [x] Show documents to verify
- [x] Show customer explanation
- [x] Show escalation note

## Phase 7: Admin Dashboard

- [x] Add admin login screen
- [x] Protect admin dashboard
- [x] Add bank create/edit
- [x] Add process create/edit
- [x] Add process verification controls
- [x] Add feedback review

## Phase 8: Feedback System

- [x] Add public feedback form
- [x] Store feedback in database
- [x] Show feedback in admin dashboard
- [x] Allow feedback status updates

## Phase 9: Verification And Hardening

- [ ] Verify backend health route
- [ ] Verify migrations
- [ ] Verify seed data
- [ ] Verify customer assistant stored answers
- [ ] Verify unavailable answer behavior
- [ ] Verify employee copilot stored answers
- [ ] Verify admin process edits
- [ ] Verify feedback flow
- [ ] Verify no invented banking facts

## Phase 10: Deployment Preparation

- [ ] Add `.env.example`
- [ ] Add setup instructions
- [ ] Add migration instructions
- [ ] Add seed command instructions
- [ ] Add production configuration notes
