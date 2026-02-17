# College ERP Portal - Setup Guide

A quick start guide to get the College ERP Portal running on your machine.

## Prerequisites

- **Node.js**: 18.17 or later ([Download](https://nodejs.org/))
- **npm**: 9+ or **yarn**: 3+
- **Git**: For version control
- **VS Code** (Recommended): For the best development experience

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/01xharshu/erp.git
cd erp
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

No additional configuration needed for local development - the defaults are already set!

### 4. Install VS Code Extensions (Optional but Recommended)

Click on Extensions in VS Code and install these:
- **ESLint** - `dbaeumer.vscode-eslint`
- **Prettier** - `esbenp.prettier-vscode`
- **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`

Or VS Code will suggest them automatically from `.vscode/extensions.json`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Field | Value |
|-------|-------|
| **Enrollment No** | `EN2024001` |
| **Password** | `password123` |

## Available Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint to check code
npm run lint

# Type check with TypeScript
npm run type-check

# Format code with Prettier
npm run format

# All of the above
npm run validate
```

## Project Structure Overview

```
erp/
├── app/                 # Next.js app directory (routes)
│   ├── api/            # API endpoints
│   ├── (auth)/         # Login page
│   └── (dashboard)/    # Dashboard pages
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── sidebar.tsx    # Navigation sidebar
│   ├── navbar.tsx     # Top navigation
│   └── ...
├── lib/               # Utilities and helpers
├── public/            # Static files
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
└── ...config files
```

## Features Overview

### 📚 **Academic Features**
- View enrolled subjects with course details
- Check class timetable with join links
- Track attendance percentage
- View exam results and grades
- Submit and track assignments

### 💰 **Administrative Features**
- Check fee status and payment history
- Hostel services and allocation
- Library resources and requests
- Events and announcements
- Academic grievance portal

### ⚙️ **User Features**
- Complete student profile management
- Settings and preferences
- Dark/Light mode toggle
- Real-time notifications
- Responsive design for all devices

## Development Tips

### Code Quality
- **Linting**: Run `npm run lint` before committing
- **Type Checking**: Run `npm run type-check` to catch errors
- **Formatting**: Prettier automatically formats on save

### Hot Reload
The app automatically reloads when you save files during development.

### Browser DevTools
- Open DevTools: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Use the Network tab to monitor API calls
- Use the Console tab to check for errors

### Mock Data
Edit `/lib/mockData.ts` to change mock data shown in the app.

### Component Development
All UI components are in `/components/ui/`:
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Dark mode support included

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

### Module Not Found Error
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
Run type checking:
```bash
npm run type-check
```

Check `tsconfig.json` if issues persist.

### Styling Not Applied
Make sure Tailwind is working:
```bash
# Check if tailwind classes are being generated
npm run build
```

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
Vercel is optimized for Next.js:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and select your repository
4. Configure environment variables if needed
5. Click "Deploy"

Your app will be live in minutes!

### Other Hosting Options
- **Netlify**: Supports Next.js
- **AWS Amplify**: Full AWS integration
- **Docker**: Container deployment
- **Railway**: Easy deployment platform

## File Organization Guide

### Adding a New Page
1. Create file: `app/(dashboard)/dashboard/newfeature/page.tsx`
2. Add menu item in `sidebar.tsx`
3. Import components from `components/ui/`

### Adding a New Component
1. Create in `components/` folder
2. Use styles from `components/ui/` library
3. Export from component barrel file if needed

### Adding a New Utility
1. Create in `lib/` folder
2. Export from `lib/index.ts` if it's a general utility
3. Use in your components or pages

### Adding a New Type
1. Add to `types/index.ts`
2. Use across the app with proper TypeScript support

## Git Workflow

```bash
# Create a new branch for features
git checkout -b feature/feature-name

# Make your changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/feature-name

# Create a Pull Request on GitHub
```

## Performance Optimization

The project includes:
- ✅ Image optimization with Next.js
- ✅ Code splitting and lazy loading
- ✅ CSS-in-JS with Tailwind (no runtime overhead)
- ✅ Font optimization with Geist fonts
- ✅ Automatic route prefetching

## Security Features

- ✅ XSS protection headers
- ✅ Clickjacking prevention (X-Frame-Options)
- ✅ Content Security Policy ready
- ✅ Secure authentication flow
- ✅ Protected API routes

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

Mobile browsers are fully supported on iOS and Android.

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Radix UI Components](https://www.radix-ui.com/)

## Getting Help

- Check the **README.md** for general info
- Look at **PROJECT_STRUCTURE.md** for file organization
- Review existing code in similar pages
- Check GitHub Issues for common problems
- Ask in the discussions or create an issue

## Next Steps

1. ✅ Installation complete - run `npm run dev`
2. Login with demo credentials
3. Explore all the features
4. Review the code structure
5. Customize for your college
6. Deploy to production

## Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/01xharshu/erp)
- Check existing issues first
- Provide screenshots and error details

---

**Happy Coding!** 🚀

Last Updated: February 2025
