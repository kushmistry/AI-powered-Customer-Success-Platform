# AI-Powered Customer Success Platform (E2M)

An enterprise-ready **AI-Powered Customer Success Insights Platform** that empowers teams to manage customer accounts, track touchpoints and meetings, automatically generate structured AI intelligence using **Google Gemini**, send background SMTP email notifications, and visualize operational health via a real-time dashboard.

Built with a high-performance **monorepo architecture** using **Next.js 14 (App Router)**, **FastAPI**, **PostgreSQL**, **Redis**, and **Docker Compose V2**.

---

## 🌐 Live Deployed Application

| Service | Live URL | Platform |
| :--- | :--- | :--- |
| **Frontend Web App** | **[https://ai-powered-customer-success-platfor-xi.vercel.app](https://ai-powered-customer-success-platfor-xi.vercel.app)** | Vercel (Next.js 14 Edge) |
| **Backend API & Swagger Docs** | **[https://ai-powered-customer-success-platform-oxg8.onrender.com/docs](https://ai-powered-customer-success-platform-oxg8.onrender.com/docs)** | Render (Docker Web Service) |
| **Cloud Database** | Neon Serverless PostgreSQL 16 | AWS US-East |
| **Cloud Cache** | Upstash Serverless Redis 7 (TLS) | Upstash Cloud |

### 🔑 Demo Credentials (Ready to Test):

| Role | Email | Password | Permissions Summary |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@e2m.com` | `Admin123!` | **Full Superuser Authority:** Exclusively access Team & Role Management (`/users`), assign/change roles, delete users, and delete customer records |
| **Manager** | `manager@e2m.com` | `Manager123!` | **Operational Lead:** Create/Edit customers (no delete rights), log touchpoints, generate Gemini AI insights (No team management access) |
| **Viewer** | `viewer@e2m.com` | `Viewer123!` | **Read-Only Stakeholder:** View dashboard metrics, customer directories, interaction notes (no write/delete permissions) |


---

## 🌟 Core Features & Capabilities

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication:** Secure access token and refresh token flow with bcrypt password hashing.
- **Strict Role Hierarchy:**
  - **Admin:** Complete system authority, exclusive customer deletion rights, and team role management.
  - **Manager:** Operational lead with full CRUD on Customers and Interactions, AI insight generation.
  - **Viewer:** Read-only access to customer directories, interaction notes, and dashboard reporting.
- **Team & Role Management (`/users`):** Dedicated admin portal to view all team members, assign or change roles (`admin`, `manager`, `viewer`), and manage accounts.
- **Self-Service Profile Modal:** Any user can click their avatar card in the sidebar to update their full name and email address.
- **Client Auto-Recovery:** Automatic token injection via Axios interceptors, expired session detection, and smooth login redirection.

### 2. 👥 Customer Portfolio Management
- **Full CRUD:** Create, read, update, and delete customer accounts.
- **Debounced Real-Time Search:** Search by company name, contact, or email with a 400ms debounce on keystrokes (`onChange`) and instant execution on <kbd>Enter</kbd>.
- **Status Filtering:** Instant filtering across `Active`, `Inactive`, and `Churned` customer lifecycles.
- **Form Usability:** Clear visual indicators with red asterisks (`*`) on required fields and Ant Design UI form validation.

### 3. 🤝 Meeting & Touchpoint Management
- **Multi-Channel Logging:** Track `Meetings` (🤝), `Phone Calls` (📞), and `Emails` (✉️).
- **Ant Design Date & Time Picker:**
  - Date and time selection with `showTime` formatting (`YYYY-MM-DD HH:mm`).
  - **Future Date & Time Disabling:** Automatically greys out future calendar days and future hours/minutes of today so only valid, historical interactions can be logged.
  - **Date Range Filters:** Filter touchpoint timelines using Ant Design's `DatePicker.RangePicker`.

### 4. 🧠 Resilient Google Gemini AI Engine
- **Structured Intelligence:** Automatically extracts:
  - 📝 **Executive Summary** (concise 2-3 sentence brief)
  - 🎯 **Sentiment Classification** (`Positive`, `Neutral`, `Negative`)
  - ✅ **Action Items & Follow-ups**
  - ⚠️ **Key Risks or Blockers**
- **Multi-Model Fallback Chain:**
  - Automatically switches between `gemini-3.5-flash` → `gemini-3.8-flash` → `gemini-3.1-flash-lite` → `gemini-flash-lite-latest`.
  - Seamlessly handles **429 (Rate Limit / Quota Exceeded)** or **404 (Model Unavailable)** errors without failing requests.
- **Timeout Protection & Data-First Persistence:**
  - Interactions are **persisted to the database first**.
  - AI generation runs with strict per-model timeouts (3.5s) and an overall 8s cap. If Gemini takes too long or is unavailable, the interaction is saved safely and the user receives a clear, non-blocking notification.
  - Built-in heuristic NLP analysis acts as a permanent offline safety net.
- **On-Demand Regeneration:** Re-analyze meeting notes anytime from the interaction details page.

### 5. 📊 Real-Time Operational Dashboard
- **Key Performance Indicators (KPIs):** Total accounts, total touchpoints, active churn rates, and interaction ratios.
- **Visual Analytics:** Interactive charts for Customer Status Distribution, Sentiment Breakdown, and Touchpoint Trends.
- **Recent Activity Feed:** Live list of recent customer interactions with sentiment tags and quick navigation.

### 6. ⚡ Zero-Stale-Data Redis Caching Strategy
- **Aggressive Performance Caching:** 5-minute TTL for customer queries and 2-minute TTL for aggregated dashboard metrics.
- **Instant Cache Invalidation:** Automated Redis `SCAN` + `DELETE` pipelines invalidate cache keys upon any create, update, or delete action to guarantee zero stale data.

### 7. 📧 Background Email Notifications (SMTP)
- Dispatched asynchronously via FastAPI `BackgroundTasks` for non-blocking API performance.
- Welcome email upon registration.
- Meeting summary email to customer/manager.
- **Urgent Risk Alert Email:** Triggered automatically when the AI detects negative sentiment or critical blockers.
- **Simulation Mode:** Automatically logs simulated emails in local environments without requiring active SMTP credentials.

### 8. 📦 Fixed Standard API Response Envelope
All API endpoints across the platform return a predictable, standardized envelope:
```json
{
  "status": true,
  "message": "Descriptive response message",
  "data": { ... },
  "meta": { "page": 1, "size": 10, "total": 42, "pages": 5 }
}
```
All errors (400, 401, 403, 404, 422, 500) follow `{ status: false, message: string, data: null, meta: null }`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Architecture** | Monorepo (`pnpm workspaces` + `Turborepo`) |
| **Frontend** | Next.js 14 (App Router), TypeScript, Redux Toolkit, Tailwind CSS, Lucide Icons, Ant Design (`@e2m/ui`), Dayjs |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0 (Async), asyncpg, Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **AI Engine** | Google Gemini API (`google-generativeai` SDK, fallback model chain) |
| **Auth** | JWT (JSON Web Tokens) with bcrypt password hashing |
| **DevOps** | Docker, Docker Compose V2, Multi-stage production container builds |

---

## 📁 Monorepo Structure

```
E2M/
├── apps/
│   ├── backend/                     # FastAPI Application
│   │   ├── app/
│   │   │   ├── core/                # Config, security, database, Redis cache, dependencies
│   │   │   ├── models/              # SQLAlchemy 2.0 async ORM models
│   │   │   ├── repositories/        # Repository pattern data access layer
│   │   │   ├── routers/             # REST endpoints (auth, customers, interactions, insights, dashboard)
│   │   │   ├── schemas/             # Pydantic v2 request/response schemas & standard envelope
│   │   │   ├── services/            # Business logic, AI engine, email notifications
│   │   │   ├── seed.py              # Database seeder script
│   │   │   └── main.py              # Application entry point & lifespan
│   │   ├── alembic/                 # Database migrations (001_initial_schema.py)
│   │   ├── tests/                   # Pytest test suite
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── frontend/                    # Next.js 14 Web Application
│       ├── src/
│       │   ├── app/                 # Next.js App Router (Dashboard, Customers, Interactions, Auth)
│       │   ├── components/          # Reusable UI components & modals
│       │   ├── lib/                 # Axios client, Redux store & feature slices
│       │   └── types/               # TypeScript interfaces & API response contracts
│       ├── package.json
│       ├── Dockerfile
│       └── .env.example
│
├── packages/
│   ├── ui/                          # Custom UI component library wrapping Ant Design & Lucide
│   └── shared/                      # Shared constants and domain types
│
├── docker-compose.yml               # Unified multi-service orchestration
├── turbo.json                       # Turborepo task runner
├── pnpm-workspace.yaml              # Workspace definition
├── .env.example                     # Environment template for Docker Compose
└── README.md
```

---

## 🚀 Getting Started

You can run the application either with **Docker Compose (Recommended)** or via **Local Development Setup**.

---

### Option A: Running with Docker Compose (Recommended)

Docker Compose orchestrates all 4 services (**Frontend, Backend, PostgreSQL, and Redis**) with zero manual setup.

#### 1. Clone Repository & Setup Environment
```bash
git clone <your-repo-url>
cd AI-powered-Customer-Success-Platform

# Copy root environment variables
copy .env.example .env    # On Windows
# cp .env.example .env    # On Linux/macOS
```

#### 2. Start All Services
```bash
docker compose up --build -d
```

Verify all 4 containers are running and healthy:
```bash
docker compose ps
```

#### 3. Run Database Migrations & Seed Demo Data
Once containers are running, execute database setup inside the backend container:

```bash
# Apply database migrations
docker compose exec backend alembic upgrade head

# Seed initial demo data (users, customers, interactions, and AI insights)
docker compose exec backend python -m app.seed
```

#### 4. Access the Applications
- 🌐 **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- 📚 **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **PostgreSQL:** `localhost:5432`
- ⚡ **Redis:** `localhost:6379`

#### 5. Useful Docker Commands
```bash
# View backend logs in real-time
docker compose logs -f backend

# Stop all containers
docker compose down

# Stop containers and wipe database/cache volumes
docker compose down -v
```

---

### Option B: Local Development Setup (Without Docker)

Follow these steps if you want to run the frontend and backend natively on your machine.

#### Prerequisites
- **Node.js:** >= 18.18.0
- **pnpm:** `npm install -g pnpm`
- **Python:** >= 3.10
- **PostgreSQL 14+** running on `localhost:5432` (database: `e2m_db`, user: `postgres`, password: `postgres`)
- **Redis 6+** running on `localhost:6379`

---

#### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd apps/backend

# 2. Create and activate a Python virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env    # On Windows
# cp .env.example .env    # On Linux/macOS

# 5. Run database migrations via Alembic
alembic upgrade head

# 6. Seed demo accounts & data
python -m app.seed

# 7. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Backend API and Swagger UI will be live at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

#### 2. Frontend Setup

Open a new terminal window at the **repository root**:

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Configure frontend environment
cd apps/frontend
copy .env.example .env.local    # On Windows
# cp .env.example .env.local    # On Linux/macOS

# 3. Start the Next.js development server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

The platform includes demo accounts representing each RBAC role:

| Role | Email | Password | Permissions & Access |
|---|---|---|---|
| **Admin** | `admin@e2m.com` | `Admin123!` | **Full Superuser Authority:** Exclusively access Team & Role Management (`/users`), assign roles, delete users, and delete customer records |
| **Manager** | `manager@e2m.com` | `Manager123!` | **Operational Lead:** Create/Edit customers (no delete rights), log touchpoints, generate Gemini AI insights (No team management access) |
| **Viewer** | `viewer@e2m.com` | `Viewer123!` | **Read-Only Stakeholder:** View dashboard metrics, customer directories, interaction notes (no write/delete permissions) |

> [!TIP]
> You can also use the **1-Click Demo Login** buttons on the login screen (`/login`) to instantly sign in as Admin, Manager, or Viewer.

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin | Manager | Viewer | Access Level / Permission Notes |
|---|:---:|:---:|:---:|---|
| **View Dashboard & Metrics** | ✅ | ✅ | ✅ | Available to all authenticated users |
| **View Customer Directory & Details** | ✅ | ✅ | ✅ | Read-only directory access |
| **Create & Update Customer** | ✅ | ✅ | ❌ | Operational teams only |
| **Delete Customer (Destructive)** | ✅ | ❌ | ❌ | **Admin Only** (Prevent accidental data loss) |
| **View Interaction Logs & Details** | ✅ | ✅ | ✅ | Timeline & AI takeaway visibility |
| **Log New Customer Interaction** | ✅ | ✅ | ❌ | Operational teams only |
| **Generate / Re-run AI Insights** | ✅ | ✅ | ❌ | Triggers Google Gemini AI extraction |
| **View AI Insight Takeaways** | ✅ | ✅ | ✅ | Summary, sentiment, action items, risks |
| **Team & Role Management (`/users`)** | ✅ | ❌ | ❌ | **Admin Only** (Hidden from Manager & Viewer; 403 API protection) |
| **Change User Roles (`admin` / `manager` / `viewer`)** | ✅ | ❌ | ❌ | **Admin Only** (Full authority over organization permissions) |
| **Delete User Accounts** | ✅ | ❌ | ❌ | **Admin Only** (Cannot delete own logged-in account) |
| **Self-Service Profile Edit** | ✅ | ✅ | ✅ | Any user can update their full name & email via profile modal |

> [!IMPORTANT]
> ### 🔍 Key Differences: Admin vs. Manager
> - **Team & User Role Management (`/users`):** Restricted **exclusively to Admins**. Admins have sole authority to view all registered users, promote or demote team members between `admin`, `manager`, and `viewer`, and remove users. For Managers, the Team tab is hidden in navigation and any direct API requests return `403 Forbidden`.
> - **Destructive Operations (Customer Deletion):** Only **Admins** can permanently delete customer records (`DELETE /api/customers/{id}`). Managers can create and update customer records, but cannot delete them.


---

## 📡 API Endpoints Overview

All endpoints return the fixed `{ status, message, data, meta }` response structure.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user + dispatch welcome email |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JWT |
| `POST` | `/api/auth/refresh` | Public | Silent renewal of access token using refresh token |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `PUT` | `/api/auth/me` | Authenticated | Update user profile |
| `GET` | `/api/users` | Admin | List all registered team members |
| `PUT` | `/api/users/{id}` | Admin | Update user details or assign role (`admin`, `manager`, `viewer`) |
| `DELETE`| `/api/users/{id}` | Admin | Delete user account (cannot delete self) |
| `GET` | `/api/customers` | Authenticated | List customers (paginated, filtered, cached) |
| `GET` | `/api/customers/{id}` | Authenticated | Get customer details (cached) |
| `POST` | `/api/customers` | Admin, Manager | Create customer (invalidates cache) |
| `PUT` | `/api/customers/{id}` | Admin, Manager | Update customer (invalidates cache) |
| `DELETE`| `/api/customers/{id}` | Admin | Delete customer (Admin only, invalidates cache) |
| `GET` | `/api/interactions` | Authenticated | List interactions with pagination & filters |
| `GET` | `/api/interactions/{id}` | Authenticated | Get interaction with AI insight & customer |
| `POST` | `/api/interactions` | Admin, Manager | Create interaction + auto AI insights + email |
| `PUT` | `/api/interactions/{id}`| Admin, Manager | Update interaction |
| `GET` | `/api/interactions/{id}/insights` | Authenticated | Fetch AI insight for an interaction |
| `POST` | `/api/interactions/{id}/insights` | Admin, Manager | Generate or re-analyze notes with AI |
| `GET` | `/api/dashboard/metrics` | Authenticated | Aggregated KPI metrics & sentiment stats |
| `GET` | `/api/health` | Public | System health and Redis connectivity check |

Interactive API documentation and schema testing: **[http://localhost:8000/docs](http://localhost:8000/docs)** (or production: **[https://ai-powered-customer-success-platform-oxg8.onrender.com/docs](https://ai-powered-customer-success-platform-oxg8.onrender.com/docs)**).

---

## 🧪 Testing & Verification

### 1. Backend Automated Tests
```bash
cd apps/backend
pytest tests/ -v
```

Covers:
- JWT token generation, expiration, and password hashing (`test_security.py`)
- AI insight schema validation and heuristic NLP fallback (`test_ai_service.py`)
- Redis cache degradation and error handling when Redis is offline (`test_cache.py`)

### 2. Frontend Typecheck & Production Build
```bash
# Verify TypeScript types
pnpm --filter frontend exec tsc --noEmit

# Build production bundle
pnpm --filter frontend build
```

---

## 🌐 Production Cloud Architecture

The platform is deployed and fully operational on production cloud infrastructure:

- **Frontend (Vercel):** [https://ai-powered-customer-success-platfor-xi.vercel.app](https://ai-powered-customer-success-platfor-xi.vercel.app)
  - Hosted on Vercel's Edge CDN with instant 0-second cold starts.
  - Built natively from `apps/frontend` in the monorepo.
  - Environment variable: `NEXT_PUBLIC_API_URL=https://ai-powered-customer-success-platform-oxg8.onrender.com`
- **Backend (Render):** [https://ai-powered-customer-success-platform-oxg8.onrender.com](https://ai-powered-customer-success-platform-oxg8.onrender.com)
  - Docker container running FastAPI with Uvicorn.
  - Binds dynamically to Render's `$PORT` and auto-runs `alembic upgrade head` on boot.
- **Database (Neon PostgreSQL 16):**
  - Cloud serverless PostgreSQL in AWS US-East region.
  - Connection pooling with SSL TLS encryption.
- **Cache (Upstash Redis 7):**
  - Low-latency serverless Redis connected via secure TLS (`rediss://`).

