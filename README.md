# 📋 Attendance Tracker Frontend

A modern React + TypeScript web application for managing meeting attendance in organizations with hierarchical structure. Built with Vite, Tailwind CSS, and Material-UI for a responsive and intuitive user experience.

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **Role-based authentication** system with JWT tokens
- **Two user roles**: Global Admins and Vertical Heads
- **Protected routes** with automatic session management
- **Secure logout** with token cleanup

### 👨‍💼 Global Admin Features
- **User Management**: Create and manage vertical head accounts
- **System Overview**: Access to all verticals and their data
- **Comprehensive Analytics**: View attendance across all verticals
- **Export Functionality**: Download attendance reports in Excel format

### 👥 Vertical Head Features
- **Meeting Management**: Create, view, and manage meetings for your vertical
- **Attendance Tracking**: Mark attendance for team members with real-time updates
- **Member Management**: Add new members to your vertical
- **Meeting History**: Access past meetings with detailed attendance records
- **Bulk Operations**: Save multiple attendance changes efficiently

### 📊 Smart Features
- **Unsaved Changes Protection**: Browser prompts prevent data loss
- **Real-time Validation**: Instant feedback on form submissions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Navigation**: Clean, modern interface with clear role-based menus

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite with Rolldown
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS + Material-UI
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons & UI**: Material-UI components
- **File Processing**: XLSX for Excel export

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ (recommended: 18+)
- **npm** or **yarn**
- **Backend API** server running (see backend repository)

### Installation

1. **Clone the repository**
   ```bash
   https://github.com/Students-Union-PSGTech/Attendance-Tracker-frontend
   cd attendance-trackee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your backend URL
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   - Navigate to `http://localhost:5173`
   - Default Global Admin: `admin` / `admin`

## 📋 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint

# Type checking
npm run type-check
```

## 🏗️ Project Structure

```
attendance-trackee/
├── public/                 # Static assets
├── src/
│   ├── api.ts             # API endpoints and axios configuration
│   ├── types.ts           # TypeScript type definitions
│   ├── components/        # Reusable React components
│   │   ├── AddMembers.tsx
│   │   ├── MeetingForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── pages/             # Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── GlobalAdminDashboard.tsx
│   │   ├── VerticalHeadDashboard.tsx
│   │   ├── MeetingAttendancePage.tsx
│   │   └── [other pages...]
│   └── assets/           # Images, fonts, etc.
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── [config files...]     # Vite, TypeScript, Tailwind configs
```

## 🔗 API Integration

The frontend communicates with a REST API backend. Key endpoints include:

### Authentication
- `POST /auth/globaladmin/login` - Global admin login
- `POST /auth/globaladmin/logout` - Logout
- `POST /auth/verticalhead/login` - Vertical head login

### Global Admin Operations
- `POST /globaladmin/verticalleads/create` - Create vertical head
- `GET /globaladmin/verticalleads` - List all vertical heads
- `GET /globaladmin/attendance/all` - Get all attendance data

### Vertical Head Operations
- `POST /verticalhead/meetings` - Create new meeting
- `GET /verticalhead/meetings` - List meetings
- `POST /verticalhead/members/add` - Add team members
- `PUT /verticalhead/attendance/:meetingId` - Update attendance

## 🎨 Styling & UI

- **Tailwind CSS** for utility-first styling
- **Material-UI** for consistent component design
- **Responsive design** with mobile-first approach
- **Dark/Light theme** support (configurable)
- **Custom CSS** for specific component styling

## 🔧 Configuration Files

- **`vite.config.ts`** - Vite bundler configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript compiler options
- **`eslint.config.js`** - Code linting rules
- **`postcss.config.js`** - PostCSS processing

## 🌐 Environment Variables

```bash
# Backend API base URL
VITE_BACKEND_URL=http://localhost:3000

# Optional: Enable debug mode
VITE_DEBUG=false
```

## 📱 User Roles & Permissions

### Global Admin
- ✅ Create vertical heads
- ✅ View all attendance data
- ✅ Access system-wide analytics
- ✅ Export attendance reports
- ✅ Manage system settings

### Vertical Head
- ✅ Create and manage meetings
- ✅ Add team members
- ✅ Mark attendance
- ✅ View meeting history
- ❌ Access other verticals' data
- ❌ Create other vertical heads

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend allows your frontend URL in CORS settings
   - Check `VITE_BACKEND_URL` in `.env`

2. **Authentication Issues**
   - Clear browser cookies and local storage
   - Verify JWT token expiration settings

3. **Build Failures**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

- 📧 **Email**: [your-email@domain.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/Surya0265/Attendance-Tracker-frontend-project/issues)
- 📖 **Documentation**: Check the `/docs` folder for detailed guides

---

**Made with ❤️ by [Your Team Name]**
