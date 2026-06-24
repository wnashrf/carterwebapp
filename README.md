# 🎫 VouchWise / Carter Redeem – Voucher Management System

Welcome to the VouchWise / Carter Redeem repository! This is a full-stack MERN application designed for exploring, managing, and redeeming premium brand vouchers using dynamic loyalty points balances.

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

## 📋 Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **MongoDB** (Local instance running or a MongoDB Atlas cloud connection string)

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd voucherwebapp
```

---

### 2. Setup Environment Variables

Environment templates are provided via `.env.example` files in both core directories. Copy these templates to create your active configurations.

#### Backend Configuration

Navigate to the `backend/` folder, copy the template, and verify your keys:

```bash
cd backend
cp .env.example .env
```

Ensure your locally created `.env` matches your environment:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vouchwise # Or your cloud Atlas URI
JWT_SECRET=your_super_secret_jwt_key
```

#### Frontend Configuration

Open a new terminal session, navigate to the `frontend/` folder, and copy its configuration template:

```bash
cd frontend
cp .env.example .env
```

Ensure your configuration points to your local backend engine port:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SERVER_URL=http://localhost:5000
```

---

### 3. Run the Backend Server

Navigate to the `backend` folder, install the dependencies, and start the server:

```bash
cd backend
npm install
npm run dev
```

The server will initialize on `http://localhost:5000`.

#### Database Seeding (Optional)

To populate your MongoDB workspace with core catalog categories, sample vouchers, and initialize your primary testing account balances, run:

```bash
npm run seed
```

---

### 4. Run the Frontend App

Navigate to the frontend folder, install the client dependencies, and boot up the UI server:

```bash
cd frontend
npm install
npm start
```

The web application will spin up automatically in your browser window at `http://localhost:3000`.

---

## 🛠️ Project Architecture

Here is an overview of how the repository is structured:

```text
voucherwebapp/
├── backend/                # Express & Node.js Backend REST API
│   ├── config/             # Database connection setup
│   ├── controllers/        # Controller functions for business logic
│   ├── middleware/         # Authentication and request handlers
│   ├── models/             # Mongoose Schemas (User, Voucher, Category, Cart, etc.)
│   ├── routes/             # REST Endpoint mappings
│   ├── scripts/            # Database seeding scripts (seed.js)
│   ├── utils/              # Utility helper functions
│   ├── .env                # Backend local environment config
│   └── server.js           # Server entry point
│
├── frontend/               # React SPA Frontend Client
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── api/            # Centralized API client/services (Cart, Auth, Vouchers)
│   │   ├── components/     # Shared UI/Layout components
│   │   ├── pages/          # View/page components (Home, Categories, Cart, Profile, etc.)
│   │   ├── App.js          # Main App router
│   │   ├── index.css       # Core global/custom stylesheet
│   │   └── index.js        # React bootstrap entry point
│   └── .env                # Frontend environment config
└── README.md
```

## 🔑 Demo Credentials

Once the database has been seeded, you can sign in using the following test account:

- **Username / Email:** `demo@example.com`
- **Password:** `Password123`
