# NexusHR - Modern HR Management Platform

A comprehensive Next.js-based HR management system with TypeScript, Tailwind CSS, and advanced features including AI-powered recruitment, role-based access control, and real-time analytics.

## 🚀 Features

### Core Modules
- **🔐 Authentication System** - Role-based login with OAuth integration
- **📊 Dashboard** - Role-specific widgets and real-time insights
- **👥 Employee Directory** - Complete employee management with search and filtering
- **💼 Recruitment** - AI-powered candidate screening and pipeline management
- **💰 Payroll** - Comprehensive payroll processing and tax management
- **📅 Leave Management** - Leave applications, approvals, and calendar integration
- **⏰ Attendance** - Time tracking with analytics and reporting
- **🎯 Performance** - Goal setting, OKR tracking, and performance reviews
- **📈 Reports & Analytics** - Advanced reporting with data visualization

### Technical Features
- **🎨 Modern UI/UX** - Clean, responsive design with dark mode support
- **🌟 3D Effects** - Three.js integration for enhanced visual experience
- **📱 Mobile Responsive** - Optimized for all device sizes
- **⚡ Fast Performance** - Optimized with Next.js App Router
- **🔒 Security** - JWT authentication and role-based permissions
- **🎭 Animations** - Smooth animations with Framer Motion
- **🎯 TypeScript** - Full type safety and better developer experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI integration
- **Animations**: Framer Motion
- **3D Graphics**: Three.js
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Charts**: Chart.js / React-Chartjs-2
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexushr-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Demo Accounts

The application includes demo accounts for testing different user roles:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@nexushr.com | admin123 | Full system access |
| **HR** | hr@nexushr.com | hr123 | Recruitment, employees, leaves |
| **Manager** | manager@nexushr.com | manager123 | Team management, approvals |
| **Employee** | employee@nexushr.com | employee123 | Personal dashboard, leaves |

## 📚 User Roles & Permissions

### Management Admin
- Complete system access
- Employee management (CRUD)
- Payroll processing
- System configuration
- Advanced analytics

### HR Recruiter
- Recruitment management
- Employee directory access
- Leave approvals
- HR reports
- AI candidate screening

### Senior Manager
- Team oversight
- Leave approvals
- Performance reviews
- Team analytics
- Direct report management

### Employee
- Personal dashboard
- Leave applications
- Attendance tracking
- Performance goals
- Payslip access

## 🎨 Design System

The application follows a consistent design system inspired by modern HR platforms:

- **Color Palette**: Teal primary with semantic colors
- **Typography**: Inter font family for readability
- **Spacing**: 8px grid system
- **Components**: Reusable, accessible UI components
- **Animations**: Subtle micro-interactions
- **Responsive**: Mobile-first approach

## 🔧 Architecture

```
src/
├── app/                 # Next.js App Router
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── pages/          # Page components
│   ├── providers/      # Context providers
│   └── widgets/        # Dashboard widgets
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME=NexusHR
NEXT_PUBLIC_API_URL=your-api-url
```

## 🔮 Upcoming Features

- **AI Integration**: Advanced candidate matching algorithms
- **Real-time Chat**: Team communication system
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Third-party system connectors
- **Document Management**: File storage and sharing
- **Video Interviews**: Built-in video calling
- **Expense Management**: Expense tracking and approvals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Design inspiration from modern HR platforms
- Icons from Lucide React
- UI components inspired by Material Design
- Color palette optimized for accessibility

---

**Built with ❤️ for modern HR teams**
