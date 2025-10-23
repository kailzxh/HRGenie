# 🧞‍♀️ HRGenie - Complete HR Management System

![HRGenie](https://img.shields.io/badge/HRGenie-HR%2520Management-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)

A modern, **AI-powered Human Resource Management System** built with **Next.js**, **Node.js**, and **Supabase**.  
HRGenie provides comprehensive HR solutions including employee management, attendance tracking, payroll processing, performance reviews, and recruitment management.

---

## 🌟 Live Demos

- **Frontend:** [https://hr-genie-jrta.vercel.app/](https://hr-genie-jrta.vercel.app/)
- **Backend API:** [https://hr-genie-u2cc.vercel.app/](https://hr-genie-u2cc.vercel.app/)

---

## 📁 Project Structure

HRGenie/
├── 📁 packages/ # Main application packages
│ ├── 📁 frontend/ # Next.js 14 frontend application
│ ├── 📁 backend/ # Express.js backend API
│ └── 📁 onboarding/ # Onboarding system
│ └── 📁 server/ # Onboarding server
├── 📁 docs/ # Project documentation
├── 📄 README.md # This file
├── 📄 .gitignore # Git ignore rules
└── 📄 package.json # Root package configuration


---

## 🚀 Quick Start

### 🧰 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

---

### ⚙️ Installation

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/kailzxh/HRGenie.git
cd HRGenie
Install dependencies for each package
# Install root dependencies
npm install

# Frontend
cd packages/frontend
npm install

# Backend
cd ../backend
npm install

# Onboarding
cd ../onboarding
npm install

🌍 Environment Setup
Frontend (packages/frontend/.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url

Backend (packages/backend/.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret

💻 Run development servers
# Frontend (http://localhost:3000)
cd packages/frontend
npm run dev

# Backend (http://localhost:5000)
cd packages/backend
npm run dev

# Onboarding (if needed)
cd packages/onboarding
npm run dev

🏗️ Architecture Overview
🧩 Technology Stack

Frontend (packages/frontend):

Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS + Framer Motion

UI: Custom Component Library (Lucide Icons)

State: React Context + Hooks

Auth: Supabase Authentication

Backend (packages/backend):

Runtime: Node.js + Express.js

Language: TypeScript

Database: PostgreSQL (Supabase)

Auth: JWT with Supabase

Storage: Supabase Storage

Onboarding:

React-based onboarding system

Custom onboarding server

🗃️ Database Schema (Supabase)

employees – Employee master data

attendance_records – Clock in/out tracking

payroll_runs & payroll_lines – Salary processing

reviews & goals – Performance management

bias_alerts – AI bias detection

recruitment_applications – Hiring pipeline

📊 Core Features
🎯 Employee Management

Complete lifecycle management

Role-based access (Admin, HR, Manager, Employee)

Department and position management

Employee profiles and documents

⏰ Smart Attendance

Location-based clock in/out

Shift management with grace periods

Regularization requests and approvals

Monthly attendance summaries

💰 Payroll System

Automated salary calculations

Tax configuration and compliance

Payslip generation and distribution

Audit trails

📈 Performance Management

360-degree performance reviews

Goal setting and tracking

AI-powered bias detection

Skills assessment

🎯 Recruitment Pipeline

Job opening management

Candidate tracking

Interview scheduling and feedback

Offer letter generation

🌴 Leave Management

Flexible leave policies

Approval workflows

Balance tracking

Document uploads

🤖 AI-Powered Features

Bias Detection: Identify review bias

Predictive Analytics: Workforce trends

Smart Scoring: Candidate ranking

Performance Insights: Automated calibration

🔧 API Endpoints
🔐 Authentication
| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/login`    | User authentication  |
| POST   | `/api/auth/register` | User registration    |
| POST   | `/api/auth/google`   | Google OAuth         |
| GET    | `/api/auth/user`     | Current user profile |
🕒 Attendance
| Method | Endpoint                        | Description             |
| ------ | ------------------------------- | ----------------------- |
| GET    | `/api/attendance/employee-view` | Employee dashboard      |
| GET    | `/api/attendance/manager-view`  | Team overview           |
| POST   | `/api/attendance/clock-in`      | Clock in                |
| POST   | `/api/attendance/clock-out`     | Clock out               |
| POST   | `/api/attendance/regularize`    | Regularization requests |
📈 Performance
| Method | Endpoint                           | Description          |
| ------ | ---------------------------------- | -------------------- |
| GET    | `/api/performance/employee-view`   | Employee performance |
| GET    | `/api/performance/manager-view`    | Team performance     |
| POST   | `/api/performance/goals`           | Goal management      |
| POST   | `/api/performance/reviews`         | Performance reviews  |
| POST   | `/api/performance/bias-mitigation` | Bias handling        |
🧩 Recruitment
| Method | Endpoint                                    | Description        |
| ------ | ------------------------------------------- | ------------------ |
| GET    | `/api/recruitment/jobs`                     | Job listings       |
| POST   | `/api/recruitment/jobs`                     | Create job         |
| GET    | `/api/recruitment/applications`             | Candidate pipeline |
| POST   | `/api/recruitment/applications/bulk-update` | Bulk operations    |
🧱 Development
Code Structure
Frontend
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── page-components/ # Main pages
│   ├── ui/              # Reusable UI
│   └── providers/       # Context providers
├── hooks/               # Custom hooks
├── types/               # TypeScript definitions
└── utils/               # Utility functions
Backend
src/
├── controllers/         # Route handlers
├── middleware/          # Custom middleware
├── routes/              # API routes
├── types/               # Type definitions
└── utils/               # Helper functions
🚀 Deployment
🧭 Vercel Deployment
# Deploy frontend
cd packages/frontend
vercel --prod

# Deploy backend
cd packages/backend
vercel --prod
Environment Variables

Frontend:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_URL


Backend:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET

🔒 Security Features

Role-based Access Control

JWT Authentication

Data Encryption

Audit Logging

Input Validation

CORS Protection

🤝 Contributing

We welcome contributions!

Fork the repository

Create a feature branch

git checkout -b feature/amazing-feature


Commit your changes

git commit -m "Add some amazing feature"


Push to the branch

git push origin feature/amazing-feature


Open a Pull Request

📄 License

This project is licensed under the MIT License — see the LICENSE
 file for details.

🆘 Support

📧 Email: [Your Email]

🐛 Issues: GitHub Issues

💬 Discussions: GitHub Discussions

🙏 Acknowledgments

Supabase — Backend-as-a-service

Vercel — Seamless deployment

Tailwind CSS — Utility-first styling

Open Source Community ❤️

HRGenie – Transforming HR management with AI-powered insights and modern technology.
