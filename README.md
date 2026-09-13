<p align="center">
  <img src="frontend/src/assets/logo.png" alt="BookMe Logo" width="180" />
</p>

<h1 align="center">BookMe</h1>

<p align="center">
  <strong>A modern, full-stack appointment scheduling & payments platform for service providers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Calendar-Sync-4285F4?logo=google-calendar&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

---

## 📖 Overview

**BookMe** is an end-to-end scheduling platform that lets service providers (freelancers, consultants, salons, tutors, etc.) create a personalized booking page, accept appointments, collect payments via Stripe, and manage everything from a sleek dashboard — all without needing to build their own website.

**Customers** simply visit the provider's unique booking link (e.g. `/book/john-doe`), pick a service and time slot, pay online, and receive email confirmations — no account needed.

---

## ✨ Features

### 🧑‍💼 For Service Providers

| Feature | Description |
|---|---|
| **Personalized Booking Page** | Each provider gets a unique slug-based public page (`/book/<slug>`) with branded themes |
| **Service Management** | Create, edit, toggle, and delete services with custom name, duration, price, and icon |
| **Availability Scheduling** | Set weekly availability windows (day-of-week + time slots) with overlap detection |
| **Booking Management** | View, confirm, cancel, and reschedule incoming bookings with real-time status tracking |
| **Dashboard & Analytics** | Revenue charts, booking trends, upcoming appointments, and wallet balance at a glance |
| **Wallet & Withdrawals** | Track earnings, request withdrawals to bank account or UPI, and monitor payout status |
| **Payout Details** | Configure bank account (name, account last 4, IFSC) and UPI ID for receiving payouts |
| **Google Calendar Sync** | Connect Google Calendar via OAuth 2.0 — bookings are auto-synced as calendar events |
| **Brand Customization** | Choose from 5 color themes (Emerald, Indigo, Rose, Amber, Slate) and set a brand accent color |
| **Email Notifications** | Automated emails for new bookings, cancellations, reschedules, reminders, and payment receipts |

### 👤 For Customers

| Feature | Description |
|---|---|
| **No-Account Booking** | Book appointments without creating an account — just name and email |
| **Real-Time Slot Availability** | Only see available time slots based on the provider's schedule and existing bookings |
| **Stripe Payments** | Secure payment via Stripe Checkout for paid services |
| **Add to Calendar** | One-click "Add to Google Calendar" link in the booking confirmation |
| **Email Confirmations** | Receive booking confirmation, cancellation, and reminder emails |

### 🛡️ Admin Panel

| Feature | Description |
|---|---|
| **Admin Dashboard** | Overview of total users, bookings, revenue, platform fees, and provider payouts |
| **User Management** | View all registered providers with their business details and contact info |
| **Withdrawal Management** | Review, process, approve, or reject provider withdrawal requests |
| **Booking Overview** | Monitor recent bookings across all providers |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios, Lucide Icons |
| **Backend** | Node.js, Express 5, Mongoose 9 (MongoDB ODM) |
| **Database** | MongoDB Atlas |
| **Payments** | Stripe Checkout + Webhooks |
| **Calendar** | Google Calendar API (OAuth 2.0) |
| **Email** | Nodemailer + Gmail SMTP |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |

---

## 📁 Project Structure

```
BookMe/
├── backend/
│   ├── config/              # Database connection
│   ├── controllers/         # Route handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── availabilityController.js
│   │   ├── bookingController.js
│   │   ├── integrationController.js
│   │   ├── paymentController.js
│   │   ├── publicController.js
│   │   └── serviceController.js
│   ├── middleware/           # Auth & admin auth middleware
│   ├── models/              # Mongoose schemas
│   │   ├── Availability.js
│   │   ├── Booking.js
│   │   ├── EmailOtp.js
│   │   ├── Service.js
│   │   ├── User.js
│   │   ├── Withdrawl.js
│   │   └── walletTransaction.js
│   ├── routes/              # Express route definitions
│   ├── utils/               # Helpers (email, calendar, slots, wallet, etc.)
│   ├── server.js            # App entry point
│   └── .env                 # Environment variables (not committed)
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── admin/           # Admin login & dashboard pages
│   │   ├── api/             # Axios API clients
│   │   ├── assets/          # Images, logos, styles
│   │   ├── components/      # Reusable components (Layout, Charts, StatusPanel)
│   │   ├── pages/           # All app pages
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── AvailabilityPage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── PaymentsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── PublicBookingPage.jsx
│   │   │   ├── BookingSuccessPage.jsx
│   │   │   └── BookingCancelledPage.jsx
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** account (or local MongoDB)
- **Stripe** account (for payment processing)
- **Google Cloud Console** project (for Calendar integration)
- **Gmail** account with App Password (for sending emails)

### 1. Clone the Repository

```bash
git clone https://github.com/MrKhan092/BookMe.git
cd BookMe
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your-jwt-secret-key

# Gmail SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
GMAIL_SENDER_NAME=BookMe

# Google OAuth (Calendar Integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integration/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Admin Credentials
ADMIN_EMAIL=admin@bookme.com
ADMIN_PASSWORD=your-admin-password
```

Start the backend server:

```bash
npm start
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the dev server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new provider |
| `POST` | `/login` | Login and receive JWT |
| `POST` | `/send-otp` | Send OTP for email verification |
| `POST` | `/verify-otp` | Verify email OTP |
| `GET` | `/me` | Get current user profile |
| `PUT` | `/profile` | Update profile |

### Services (`/api/services`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List provider's services |
| `POST` | `/` | Create a new service |
| `PUT` | `/:id` | Update a service |
| `DELETE` | `/:id` | Delete a service |

### Availability (`/api/availability`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get weekly availability |
| `PUT` | `/` | Update availability slots |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List provider's bookings |
| `PATCH` | `/:id/cancel` | Cancel a booking |
| `PATCH` | `/:id/reschedule` | Reschedule a booking |

### Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/overview` | Get payment overview & wallet balance |
| `POST` | `/withdrawls` | Request a withdrawal |
| `PUT` | `/payout-details` | Update payout details |

### Public (`/api/public`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:slug` | Get provider's public profile |
| `GET` | `/:slug/slots` | Get available slots for a date |
| `POST` | `/:slug/book` | Create a booking |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Admin login |
| `GET` | `/dashboard` | Get admin dashboard data |
| `PATCH` | `/withdrawals/:id` | Update withdrawal status |

### Google Integration (`/api/integration`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/google/auth-url` | Get Google OAuth URL |
| `GET` | `/google/callback` | OAuth callback handler |

---

## 💳 Payment Flow

```
Customer selects a paid service
        │
        ▼
Booking created (status: pending_payment)
        │
        ▼
Redirected to Stripe Checkout
        │
   ┌────┴────┐
   ▼         ▼
Success    Cancelled
   │         │
   ▼         ▼
Booking    Booking
confirmed  cancelled
   │
   ▼
Provider payout credited to wallet
   │
   ▼
Provider requests withdrawal
   │
   ▼
Admin approves / rejects
```

---

## 📅 Google Calendar Integration

1. Provider navigates to **Profile → Integrations**
2. Clicks **Connect Google Calendar**
3. Authorizes via Google OAuth 2.0 consent screen
4. All future bookings are automatically synced to Google Calendar
5. Cancelled bookings are removed from the calendar

---

## 🔐 Authentication

- **Providers**: JWT-based auth stored in `localStorage`. Tokens expire in 7 days.
- **Admin**: Separate JWT with admin role. Credentials are set via environment variables.
- **Customers**: No authentication required — bookings are made with just name and email.

---

## 🎨 Theming

Providers can customize their public booking page with:

| Theme | Primary Color |
|---|---|
| 🟢 Emerald | `#047857` |
| 🔵 Indigo | `#4338CA` |
| 🔴 Rose | `#BE123C` |
| 🟡 Amber | `#B45309` |
| ⚫ Slate | `#334155` |

---

## 🛠️ Environment Variables Reference

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `GMAIL_SENDER_NAME` | Sender name in emails |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `ADMIN_EMAIL` | Admin panel login email |
| `ADMIN_PASSWORD` | Admin panel login password |

---

## 📜 License

This project is licensed under the ISC License.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/MrKhan092">MrKhan092</a>
</p>
