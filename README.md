# Slice

> Split expenses with friends. No awkward conversations.

Slice is a full-stack web application that makes splitting shared expenses effortless. Whether you're on a trip with friends, sharing a flat, or splitting office lunch bills — Slice tracks every expense and tells you the minimum number of payments needed to settle up completely.

**Live demo:** [sliceapp-pi.vercel.app](https://sliceapp-pi.vercel.app)

---

## Features

**Core**
- Create groups for any shared expense situation — trips, flatmates, events
- Add expenses with category tags, notes, and receipt photo uploads
- Automatic equal-split calculation across all group members
- Smart settlement algorithm — minimizes the number of payments to zero out all debts
- Real-time balance view showing exactly who owes whom

**Accounts**
- Email and password authentication with JWT sessions
- Forgot password flow with secure reset links via email
- Persistent login across sessions

**Groups**
- Invite members by email with automatic notification
- Edit group name, description, and currency
- Remove members (only when they have no unsettled debts)
- Delete groups with full cascade cleanup
- Multi-currency support — INR, USD, EUR, GBP

**Notifications**
- Email notification when added to a group
- Email notification when a new expense is logged
- Email notification when someone settles up with you
- Monthly expense summary email on the 1st of every month

**UX**
- Fully responsive — works on mobile, tablet, and desktop
- PWA support — installable on iPhone and Android home screens
- Dark sidebar layout with animated transitions
- Public landing page with product overview

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT, bcryptjs |
| Email | Nodemailer with Gmail SMTP |
| File uploads | Cloudinary, Multer |
| Scheduling | node-cron |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | MongoDB Atlas |

---

## Project structure

```
slice/
├── client/                          # React frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── api/                     # Axios instance + API call functions
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # Global auth state
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # Page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json
│   └── package.json
│
└── server/                          # Express backend
    ├── config/                      # DB, email, cloudinary setup
    ├── controllers/                 # Route logic
    ├── middleware/                  # JWT auth middleware
    ├── models/                      # Mongoose schemas
    ├── routes/                      # API routes
    ├── services/                    # Cron jobs
    ├── utils/                       # Email templates + helpers
    └── index.js
```

---

## Getting started locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Gmail account with 2FA enabled
- Cloudinary account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/slice.git
cd slice
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_string

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
EMAIL_FROM="Slice <your_gmail@gmail.com>"

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | Gmail address used to send emails |
| `EMAIL_PASS` | Gmail app password |
| `EMAIL_FROM` | Display name and address in sent emails |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL — used in email links |
| `NODE_ENV` | `development` or `production` |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL — must end with `/api` |

---

## API reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/forgot-password` | No | Send reset email |
| POST | `/api/auth/reset-password/:token` | No | Reset password |

### Groups

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/groups` | Yes | Create group |
| GET | `/api/groups` | Yes | Get user's groups |
| GET | `/api/groups/:id` | Yes | Get group details |
| PATCH | `/api/groups/:id` | Yes | Edit group |
| DELETE | `/api/groups/:id` | Yes | Delete group |
| POST | `/api/groups/:id/members` | Yes | Add member by email |
| DELETE | `/api/groups/:id/members/:userId` | Yes | Remove member |

### Expenses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/groups/:id/expenses` | Yes | Add expense |
| GET | `/api/groups/:id/expenses` | Yes | List expenses |
| GET | `/api/expenses/:id/splits` | Yes | Get splits for expense |
| DELETE | `/api/expenses/:id` | Yes | Delete expense |

### Balances & Settlements

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/groups/:id/balances` | Yes | Get balance summary |
| POST | `/api/groups/:id/settle` | Yes | Record a settlement |

---

## How the settlement algorithm works

The naive approach to settling group debts creates too many transactions. Slice uses a greedy minimization algorithm:

1. Compute each person's net balance across all unsettled splits
2. Separate users into creditors (positive balance) and debtors (negative balance)
3. Sort both lists largest first
4. Match the biggest creditor with the biggest debtor — the smaller amount is the payment
5. Repeat until all balances are zero

This produces at most **N-1 transactions** for N people — the mathematical minimum. A group of 5 needs at most 4 payments to fully settle, regardless of how many individual expenses exist.

---

## Deployment

### Backend — Render

1. Create a new Web Service on [render.com](https://render.com)
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Add all backend environment variables
6. Deploy

### Frontend — Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Root Directory: `client`
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add `VITE_API_URL` pointing to your Render URL + `/api`
7. Deploy

---

## Roadmap

- [ ] Shareable group invite links
- [ ] Edit expenses after creation
- [ ] Google OAuth login
- [ ] Personal spending analytics
- [ ] CSV export for group expenses
- [ ] Dark mode
- [ ] Delete account

---

## License

MIT