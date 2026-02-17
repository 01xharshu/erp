# College ERP Portal

A modern, responsive Educational Resource Planning (ERP) system built with Next.js 14, React 18, and TypeScript. Perfect for college students to manage their academics, attendance, fees, and more.

## Features

### 📚 Academic Management
- **Subjects**: View enrolled subjects with course details and syllabus
- **Timetable**: Check class schedule with room numbers and join links
- **Assignments**: Submit assignments and track grading status
- **Results**: View exam results with grade calculations and CGPA
- **Attendance**: Monitor attendance records and percentage

### 💰 Administrative
- **Fees**: Track fee payments and due dates
- **Hostel**: Manage hostel allocation and requests
- **Grievance**: Lodge and track grievances

### 🔍 Additional Features
- **Profile**: Update personal information and academic details
- **Notifications**: Real-time notifications for important announcements
- **Dark Mode**: Built-in light/dark theme support
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **PWA Support**: Progressive Web App capabilities

## Tech Stack

- **Frontend Framework**: Next.js 14.1
- **UI Library**: React 18.3
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme Management**: next-themes

## Project Structure

```
erp/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes
│   │   └── login/
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── dashboard/
│   │   │   ├── assignments/
│   │   │   ├── attendance/
│   │   │   ├── events/
│   │   │   ├── fees/
│   │   │   ├── grievance/
│   │   │   ├── hostel/
│   │   │   ├── library/
│   │   │   ├── profile/
│   │   │   ├── results/
│   │   │   ├── settings/
│   │   │   ├── subjects/
│   │   │   └── timetable/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page redirect
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── login-form.tsx            # Login form component
│   ├── navbar.tsx                # Top navigation bar
│   ├── protected-route.tsx        # Route protection wrapper
│   ├── sidebar.tsx               # Sidebar navigation
│   └── theme-provider.tsx        # Theme context provider
├── lib/
│   ├── auth.ts                   # Authentication utilities
│   ├── mockData.ts               # Mock data for development
│   └── utils.ts                  # Utility functions
├── public/
│   └── manifest.json             # PWA manifest
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── .env.local                    # Environment variables
```

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/01xharshu/erp.git
cd erp
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Setup environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=College ERP Portal
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Credentials

For testing purposes, use these credentials to login:

- **Enrollment Number**: `EN2024001`
- **Password**: `password123`

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Features Roadmap

- [ ] Real API integration
- [ ] Role-based access control (RBAC)
- [ ] Advanced analytics and reports
- [ ] Parent/Guardian portal access
- [ ] Mobile app (React Native)
- [ ] Video lectures integration
- [ ] Online exam system
- [ ] Course recommendations
- [ ] Alumni network
- [ ] Certificate generation

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized images with Next.js Image component
- Code splitting and lazy loading
- CSS-in-JS with Tailwind CSS
- Zero JavaScript runtime for static pages

## Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Proper semantic HTML

## Security Features

- XSS protection headers
- Clickjacking prevention
- Content Security Policy
- Secure authentication with JWT
- Password hashing (mock implementation)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@collegecrp.com or open an issue on GitHub.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Toast notifications from [Sonner](https://sonner.emilkowal.ski/)

## Author

**Aarav Kumar** - [GitHub](https://github.com/01xharshu)

---

**Last Updated**: February 2025
