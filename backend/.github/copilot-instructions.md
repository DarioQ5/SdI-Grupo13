# Copilot Instructions for this repository

This file gives actionable, repository-specific guidance to an AI coding assistant working on the `backend-camionlink` FastAPI backend.

**Big Picture**:
- **Stack**: FastAPI (HTTP API) + SQLAlchemy ORM. Database connection is configured in `database.py` using `DATABASE_URL` from environment.
- **Core files**: `main.py` (API routes and controllers), `models.py` (SQLAlchemy models), `schemas.py` (Pydantic request/response models), `database.py` (engine/session), `seed_data.py` (DB seeding/setup).
- **Runtime**: `uvicorn main:app --reload --host 0.0.0.0 --port 8000` or `python main.py`.

**Important structural patterns & conventions**:
- **Spanish naming**: identifiers, comments and API paths use Spanish. Example role strings: `"proveedor"`, `"transportista"`, `"admin"` (see `main.py`).
- **Manual response shaping**: Many endpoints build response dictionaries manually (e.g. `/api/auth/login`, `/api/ordenes`). Use the corresponding Pydantic models in `schemas.py` for examples of expected shapes (e.g. `OrdenCargaDetalle`, `TransportistaDetalle`).
- **Datetime formatting**: Endpoints serialize datetimes using `.isoformat()` (see `main.py`). Preserve this when generating responses.
- **DB schema creation**: `seed_data.py` calls `Base.metadata.create_all(bind=engine)` to create tables. In `main.py` the same line is present but commented out — do not assume automatic migrations (no Alembic present).
- **No auth tokens**: Authentication currently compares `usuario.hash` to plaintext `password` (no JWT/session). Be careful when changing auth: maintain compatibility or implement a migration plan.
- **CORS**: `FRONTEND_URL` environment variable (comma-separated) is used to populate allowed origins in `main.py`.

**Developer workflows** (how to run / common commands)
- Install dependencies: `pip install -r requirements.txt`.
- PowerShell example to set DB env and run seed + server:
  - Set DB (PowerShell):
    ```powershell
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost/logistica_db"
    python seed_data.py
    python main.py
    ```
  - Or run with uvicorn:
    ```powershell
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
- To seed DB use: `python seed_data.py` (creates data and prints test credentials).

**Patterns to follow when editing code**
- Prefer editing `schemas.py` when changing the public API shape, and update corresponding code in `main.py` to return compatible dicts or model instances.
- When adding new DB fields, update `models.py`, run `Base.metadata.create_all(bind=engine)` (or use migrations) and update `seed_data.py` if initial data is needed.
- Use `SessionLocal()` via the `get_db()` dependency pattern already in `main.py`. Keep session lifecycle the same (yield then close).

**Integration points & env vars**
- `DATABASE_URL` (required): connection string used by `database.py`.
- `FRONTEND_URL` (optional): comma-separated origins used for CORS (defaults to `http://localhost:3000`).

**Files to inspect for context/examples**
- `main.py`: shows endpoints, response shaping, role checks, and how orders/viajes are created.
- `models.py`: canonical data model and relationships (e.g. `Transportista` → `Camion` → `TipoCamion`).
- `schemas.py`: expected request and response shapes — use these when returning or validating data.
- `seed_data.py`: example of programmatic creation of many related models and default data; good source for realistic fixtures.

**Safety & non-goals**
- Do not assume secure password handling; the project currently stores/checks plaintext-like hashes — flag this for security work but keep compatibility when making small changes.
- No automatic migrations present; avoid destructive schema changes without a migration plan.

If anything here is unclear or you'd like the instructions to include more examples (unit tests, CI commands, or preferred code style), tell me what to expand and I'll update this file.
