# 🚀 Startup Khumb — Ideathon Evaluation Platform

Full-stack evaluation system for **Startup Khumb** ideathon event.
5 judges · 30 startups · 7 weighted criteria · real-time leaderboard · PDF export.

---

## 🗂️ Project Structure

```
startup-khumb-ideathon/
├── backend/                 ← Node.js + Express + Socket.io
│   ├── src/
│   │   ├── server.js        ← Entry point
│   │   ├── config/
│   │   │   ├── db.js        ← MongoDB connection
│   │   │   └── seed.js      ← Seed 5 judges + 30 startups
│   │   ├── models/
│   │   │   ├── Judge.js
│   │   │   ├── Startup.js
│   │   │   └── Evaluation.js  ← Auto-calculates weighted score
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── evaluationController.js
│   │   │   └── startupController.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── middleware/
│   │   │   └── auth.js      ← JWT guard
│   │   └── sockets/
│   │       └── liveSocket.js ← Real-time leaderboard
│   ├── package.json
│   └── .env.example
│
└── frontend/               ← React + Vite + Tailwind CSS
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.jsx    ← Judge login (dark theme)
    │   │   ├── JudgePage.jsx    ← 7-criteria star evaluation
    │   │   └── AdminPage.jsx    ← Live leaderboard + PDF export
    │   ├── lib/
    │   │   ├── api.js           ← Axios instance
    │   │   ├── AuthContext.jsx  ← JWT auth state
    │   │   └── exportPDF.js     ← jsPDF full results export
    │   └── components/shared/
    │       └── StarRating.jsx   ← Interactive 5-star input
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## ⚡ Quick Start (Local)

### 1. Clone & install

```bash
# Backend
cd backend
cp .env.example .env        # edit MONGO_URI
npm install
npm run seed                # creates 5 judges + 30 startups
npm run dev                 # → http://localhost:4000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # → http://localhost:5500
```

### 2. Default judge credentials (all use same password)

| Judge | Email | Password |
|-------|-------|----------|
| Dr. Anil Mehta    | judge1@khumb.in | judge@123 |
| Prof. Sunita Rao  | judge2@khumb.in | judge@123 |
| Mr. Vikram Bose   | judge3@khumb.in | judge@123 |
| Ms. Priya Nair    | judge4@khumb.in | judge@123 |
| Dr. Rajan Kumar   | judge5@khumb.in | judge@123 |

### 3. Routes

| URL | Description |
|-----|-------------|
| `/login` | Judge login |
| `/judge` | Evaluation form (protected) |
| `/admin` | Live leaderboard + PDF export |

---

## 🧮 Scoring Formula

```
Total Score = Σ (Star Rating × Question Weightage)
```

| Criterion | Weightage | Stars | Max Points |
|-----------|-----------|-------|-----------|
| Q1 · Innovation & Novelty        | ×5 | 1–5 | 25 |
| Q2 · Problem-Solution Fit         | ×2 | 1–5 | 10 |
| Q3 · Market Potential             | ×1 | 1–5 |  5 |
| Q4 · Business Model & Feasibility | ×3 | 1–5 | 15 |
| Q5 · Team Strength & Execution    | ×2 | 1–5 | 10 |
| Q6 · Presentation Quality         | ×2 | 1–5 | 10 |
| Q7 · Social / Environmental Impact| ×1 | 1–5 |  5 |
| **TOTAL**                         |    |     | **80** |

> The leaderboard ranks startups by **average score** across all evaluating judges.

---

## 🔌 Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `leaderboard:init` | Server → Client | `{ leaderboard, maxScore }` | Sent on connect |
| `leaderboard:updated` | Server → Client | `{ leaderboard }` | Fired after every evaluation |

---

## 📡 REST API Reference

### Auth
```
POST /api/auth/login     { email, password }  → { token, judge }
GET  /api/auth/me        (Bearer token)        → { judge }
```

### Evaluations
```
POST /api/evaluations          Submit/update ratings
GET  /api/evaluations/progress  Judge's completed startups
GET  /api/evaluations/my/:id    Get judge's existing eval for a startup
GET  /api/evaluations/leaderboard  Public leaderboard
GET  /api/evaluations/admin/full   Full breakdown for PDF export
```

### Startups
```
GET    /api/startups     List all startups
POST   /api/startups     Add a startup
DELETE /api/startups/:id Remove a startup
```

---

## 🗄️ Database Schemas

### Judge
```js
{ name, email, passwordHash, avatar, isActive }
```

### Startup
```js
{ teamName, projectTitle, description, category, pitchOrder,
  averageScore,       // updated on each evaluation
  totalEvaluations }  // count of judges who scored it
```

### Evaluation
```js
{
  judgeId, startupId,
  ratings: { Q1, Q2, Q3, Q4, Q5, Q6, Q7 },  // 1–5 each
  calculatedScore,  // auto-computed by pre-save hook
  breakdown: [{ key, label, stars, weightage, score }],
  notes
}
// unique index: { judgeId, startupId } — one eval per judge per startup
// judges can re-submit (update) before deadline
```

---

## 🚀 Deployment

| Service | What to deploy |
|---------|---------------|
| [MongoDB Atlas](https://cloud.mongodb.com) | Database (free tier) |
| [Render](https://render.com) or [Railway](https://railway.app) | Backend (Node.js) |
| [Vercel](https://vercel.com) | Frontend (React + Vite) |

### Deploy backend to Render
1. Push `backend/` to GitHub
2. New Web Service → Node.js
3. Build command: `npm install`
4. Start command: `npm start`
5. Set env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`

### Deploy frontend to Vercel
1. Push `frontend/` to GitHub
2. New Project → Vite preset
3. Set env vars: `VITE_API_URL`, `VITE_SERVER_URL`

---

## 📄 PDF Export

Click **Export PDF** on `/admin` to download a 3-section PDF:
1. **Cover page** — event details + criteria legend
2. **Leaderboard** — all startups ranked by average score
3. **Per-startup breakdown** — every judge's ratings for every criterion

Powered by `jspdf` + `jspdf-autotable`.
# Jugde-evaluation-site
