# CivicConnect — Community Problem Reporting & Solution Platform

> A production-grade full-stack web application where citizens report real-world community problems, organizations propose solutions, and administrators verify, prioritize, and resolve them. Inspired by Smart India Hackathon's societal challenge concept.

---

## 🔥 Features

### Citizen (USER)
- Register, login, and manage profile
- Report community problems with photo upload
- Browse and search verified problems
- Propose solutions with cost/impact estimates
- Upvote the most promising solutions
- Track submitted problems and their status
- View personal contribution dashboard

### Organization
- View verified community problems
- Submit detailed solution proposals
- Track proposal approval status
- Organization-specific dashboard

### Administrator
- Verify or reject reported problems
- Change problem status (In Progress → Resolved)
- Approve or reject solution proposals
- Full user management (activate/deactivate accounts)
- Analytics dashboard with Recharts visualizations
- Platform-wide statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios with JWT interceptors |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Authentication | JWT + bcryptjs |
| ORM | Prisma |
| Database | PostgreSQL |
| File Upload | Multer |
| Validation | express-validator |

---

## 🏗 Architecture

```
civicconnect/
│
├── client/                    ← React + Vite frontend
│   └── src/
│       ├── components/        ← Navbar, Sidebar, ProblemCard, SolutionCard, Badges, etc.
│       ├── pages/             ← All page components (15+ pages)
│       ├── context/           ← AuthContext (JWT state management)
│       ├── services/          ← api.js (Axios instance + all API calls)
│       └── utils/             ← helpers.js (formatting utilities)
│
├── server/                    ← Express.js backend
│   ├── controllers/           ← Business logic (auth, problems, solutions, admin, users)
│   ├── routes/                ← Route definitions
│   ├── middleware/            ← auth, authorize, errorHandler, upload
│   ├── utils/                 ← priority.js (scoring algorithm)
│   └── prisma/
│       ├── schema.prisma      ← Database schema
│       └── seed.js            ← Demo data seeder
│
└── README.md
```

---

## 🗄 Database Schema

```prisma
User          → id, name, email, password, role, isActive
Problem       → id, title, description, category, location, city, imageUrl,
                severity, priorityScore, priorityLevel, status, reporterId
Solution      → id, title, description, estimatedCost, expectedImpact,
                attachmentUrl, status, problemId, contributorId
SolutionVote  → id, solutionId, userId  (unique constraint — no double voting)
ProblemStatusHistory → id, problemId, status, changedById, note
```

**Enums:**
- `Role`: USER | ORGANIZATION | ADMIN
- `ProblemStatus`: PENDING | VERIFIED | IN_PROGRESS | RESOLVED | REJECTED
- `Severity`: LOW | MEDIUM | HIGH | CRITICAL
- `Category`: ROADS | WASTE_MANAGEMENT | WATER | ELECTRICITY | EDUCATION | PUBLIC_SAFETY | ENVIRONMENT | OTHER
- `SolutionStatus`: PENDING | APPROVED | REJECTED

---

## 🧮 Priority Algorithm

Problems are scored 0–100 based on:

```
severityScore:  LOW=10, MEDIUM=30, HIGH=60, CRITICAL=100
reportsBonus:   reports × 2  (capped at 20)
proposalsBonus: proposals × 3 (capped at 15)
affectedBonus:  affectedUsers × 1 (capped at 10)

rawScore = severityScore + reportsBonus + proposalsBonus + affectedBonus (max 145)
priorityScore = (rawScore / 145) × 100
```

Priority Level: 0–24 = LOW | 25–49 = MEDIUM | 50–74 = HIGH | 75–100 = CRITICAL

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/me` | JWT | Current user |

### Problems
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/problems` | Optional | List with search/filter/pagination |
| POST | `/api/problems` | USER/ORG | Create problem |
| GET | `/api/problems/:id` | None | Get full details |
| PUT | `/api/problems/:id` | Owner/Admin | Update problem |
| DELETE | `/api/problems/:id` | Admin | Delete problem |

### Solutions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/problems/:id/solutions` | Optional | Get solutions |
| POST | `/api/problems/:id/solutions` | USER/ORG | Submit solution |
| POST | `/api/solutions/:id/vote` | Auth | Toggle upvote |
| PUT | `/api/solutions/:id` | Owner/Admin | Update solution |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | ADMIN | Analytics stats |
| GET | `/api/admin/users` | ADMIN | All users |
| PUT | `/api/admin/users/:id/status` | ADMIN | Activate/deactivate user |
| PUT | `/api/admin/problems/:id/verify` | ADMIN | Verify/reject problem |
| PUT | `/api/admin/problems/:id/status` | ADMIN | Change status |
| GET | `/api/admin/solutions` | ADMIN | All solutions |
| PUT | `/api/admin/solutions/:id/status` | ADMIN | Approve/reject solution |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Clone & Install

```bash
git clone <repo-url>
cd civicconnect

# Install backend
cd server
npm install

# Install frontend
cd ../client
npm install
```

### 2. Create PostgreSQL Database

```sql
CREATE DATABASE civicconnect;
```

### 3. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/civicconnect
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### 4. Run Migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed Database

```bash
npm run seed
```

### 7. Start Backend

```bash
npm run dev
# API running at http://localhost:5000
```

### 8. Start Frontend

```bash
cd client
npm run dev
# App running at http://localhost:5173
```

---

## 🚀 Deploying to Vercel

CivicConnect is fully configured for seamless deployment to **Vercel** as a unified full-stack application (React frontend + Express & Prisma serverless API).

📖 **Read the full step-by-step instructions in [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)** for:
1. Setting up a free cloud PostgreSQL database with Neon.tech
2. Configuring Cloudinary for image uploads
3. Deploying frontend and backend together in a single Vercel project
4. Environment variable configuration


---

## 🔑 Environment Variables

### `server/.env`

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Server port | `5000` |
| `UPLOAD_DIR` | Image upload directory | `uploads` |
| `NODE_ENV` | Environment | `development` |

---

## 🎭 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@civicconnect.com | Admin@123 |
| **User** | arjun@example.com | User@123 |
| **User** | priya@example.com | User@123 |
| **Organization** | puda@example.com | User@123 |
| **Organization** | cleancity@example.com | User@123 |

---

## 📸 Screenshots

> Add screenshots of key pages here after running the app:
> - Landing page hero
> - Explore problems page
> - Problem detail with timeline
> - Admin dashboard with charts
> - Report problem form

---

## 🔮 Future Improvements

- Email notifications on status changes
- Push notifications via Firebase
- Google Maps integration for problem location
- AI-powered priority scoring using ML
- Mobile app (React Native)
- Multi-language support (Hindi, Punjabi)
- Citizen upvoting of problems (not just solutions)
- NGO collaboration module
- Government API integration

---

## 📄 Resume Description

- **Built a full-stack community civic platform** (CivicConnect) using React, Node.js/Express, and PostgreSQL/Prisma with role-based access control (Citizen/Organization/Admin), JWT authentication, and Multer-powered image uploads, handling 5+ entity types with complex relational data
- **Designed a custom priority scoring algorithm** that normalizes problem urgency (0–100 scale) by weighing severity, community report count, solution proposals, and affected users, enabling data-driven triage for administrators
- **Implemented a complete admin analytics dashboard** with Recharts visualizations (bar, pie, line charts) displaying real-time problem category breakdowns, status distribution, and 6-month resolution trends across 15+ REST API endpoints

---

