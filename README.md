HRGenie - Complete HR Management System
https://img.shields.io/badge/HRGenie-HR%2520Management-blue
https://img.shields.io/badge/version-1.0.0-green
https://img.shields.io/badge/license-MIT-blue
https://img.shields.io/badge/status-active-success

A modern, AI-powered Human Resource Management System built with Next.js, Node.js, and Supabase. HRGenie provides comprehensive HR solutions including employee management, attendance tracking, payroll processing, performance reviews, and recruitment management.

🌟 Live Demos
Frontend: https://hr-genie-jrta.vercel.app/

Backend API: https://hr-genie-u2cc.vercel.app/

📁 Project Structure
text
HRGenie/
├── 📁 packages/                 # Main application packages
│   ├── 📁 frontend/            # Next.js 14 frontend application
│   ├── 📁 backend/             # Express.js backend API
│   └── 📁 onboarding/          # Onboarding system
│       └── 📁 server/          # Onboarding server
├── 📁 docs/                    # Project documentation
├── 📄 README.md               # This file
├── 📄 .gitignore              # Git ignore rules
└── 📄 package.json            # Root package configuration
🚀 Quick Start
Prerequisites
Node.js 18+

npm or yarn

Supabase account

Vercel account (for deployment)

Installation
Clone the repository

bash
git clone https://github.com/kailzxh/HRGenie.git
cd HRGenie
Install dependencies for each package

bash
# Install root dependencies
npm install

# Install frontend dependencies
cd packages/frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install onboarding dependencies
cd ../onboarding
npm install
Environment Setup

Create environment files for each package:

Frontend (packages/frontend/.env.local):

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url
Backend (packages/backend/.env):

env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
Run development servers

bash
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
Technology Stack
Frontend (packages/frontend):

Framework: Next.js 14 with App Router

Language: TypeScript

Styling: Tailwind CSS + Framer Motion

UI: Custom component library with Lucide Icons

State: React Context + Hooks

Auth: Supabase Authentication

Backend (packages/backend):

Runtime: Node.js + Express.js

Language: TypeScript

Database: PostgreSQL (Supabase)

Auth: JWT with Supabase

Storage: Supabase Storage

Onboarding (packages/onboarding):

Framework: React-based onboarding system

Server: Custom onboarding server

Database Schema (Supabase)
The system uses a comprehensive PostgreSQL schema with tables including:

employees - Employee master data

attendance_records - Clock in/out tracking

payroll_runs & payroll_lines - Salary processing

reviews & goals - Performance management

bias_alerts - AI bias detection

recruitment_applications - Hiring pipeline

📊 Core Features
🎯 Employee Management
Complete employee lifecycle management

Role-based access control (Admin, HR, Manager, Employee)

Department and position management

Employee profiles with documents

⏰ Smart Attendance
Location-based clock in/out

Shift management with grace periods

Regularization requests and approvals

Monthly attendance summaries

💰 Payroll System
Automated salary calculations

Tax configuration and compliance

Payslip generation and distribution

Audit trails for all transactions

📈 Performance Management
360-degree performance reviews

Goal setting and tracking

AI-powered bias detection

Skills assessment and development

🎯 Recruitment Pipeline
Job opening management

Candidate application tracking

Interview scheduling and feedback

Offer letter generation

🌴 Leave Management
Flexible leave policies

Approval workflows

Balance tracking

Document upload for extended leaves

🤖 AI-Powered Features
Bias Detection: Identifies potential bias in performance reviews

Predictive Analytics: Workforce trends and attrition risk

Smart Scoring: Candidate evaluation and ranking

Performance Insights: Automated calibration and recommendations

🔧 API Endpoints
Authentication
http
POST /api/auth/login          # User authentication
POST /api/auth/register       # User registration
POST /api/auth/google         # Google OAuth
GET  /api/auth/user           # Current user profile
Attendance
http
GET  /api/attendance/employee-view    # Employee dashboard
GET  /api/attendance/manager-view     # Team overview
POST /api/attendance/clock-in         # Clock in
POST /api/attendance/clock-out        # Clock out
POST /api/attendance/regularize       # Regularization requests
Performance
http
GET  /api/performance/employee-view   # Employee performance
GET  /api/performance/manager-view    # Team performance
POST /api/performance/goals           # Goal management
POST /api/performance/reviews         # Performance reviews
POST /api/performance/bias-mitigation # Bias handling
Recruitment
http
GET  /api/recruitment/jobs            # Job listings
POST /api/recruitment/jobs            # Create jobs
GET  /api/recruitment/applications    # Candidate pipeline
POST /api/recruitment/applications/bulk-update # Bulk operations
🛠️ Development
Code Structure
Frontend (packages/frontend/src/):

text
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── page-components/ # Main pages
│   ├── ui/             # Reusable UI
│   └── providers/      # Context providers
├── hooks/              # Custom hooks
├── types/              # TypeScript definitions
└── utils/              # Utility functions
Backend (packages/backend/src/):

text
src/
├── controllers/         # Route handlers
├── middleware/         # Custom middleware
├── routes/             # API routes
├── types/              # Type definitions
└── utils/              # Helper functions
Database Relations
Employees have self-referencing manager relationships

Attendance records link to employees with status tracking

Performance reviews support multi-participant feedback

Payroll has audit trails for compliance

Recruitment follows a staged pipeline approach

🚀 Deployment
Vercel Deployment
The project is configured for seamless deployment on Vercel:

bash
# Deploy frontend
cd packages/frontend
vercel --prod

# Deploy backend  
cd packages/backend
vercel --prod
Environment Variables
Ensure these environment variables are set in your deployment:

Frontend:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

NEXT_PUBLIC_BACKEND_URL

Backend:

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

JWT_SECRET

🔒 Security Features
Role-based Access Control: Granular permissions per user role

JWT Authentication: Secure token-based auth

Data Encryption: End-to-end encryption for sensitive data

Audit Logging: Comprehensive activity tracking

Input Validation: Robust validation middleware

CORS Protection: Configured cross-origin policies

🤝 Contributing
We welcome contributions! Please see our Contributing Guidelines for details.

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
📧 Email: [Your Email]

🐛 Issues: GitHub Issues

💬 Discussions: GitHub Discussions

🙏 Acknowledgments
Supabase for the excellent backend-as-a-service

Vercel for seamless deployment

Tailwind CSS for the utility-first CSS framework

The open-source community for countless libraries and tools

HRGenie - Transforming HR management with AI-powered insights and modern technology.
