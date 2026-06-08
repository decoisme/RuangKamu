# Ruang Kamu

A warm, personal mental wellness journaling app built with Next.js, featuring mood tracking, reflections, and AI-powered insights :)

## ✨ Features

- **🔐 Authentication System**: 
  - Secure login/register with Supabase Auth + localStorage fallback
  - **Google OAuth**: Sign in with your Google account
  - Smart duplicate email detection
  - Name persistence across sessions
  - Protected routes & auto-redirects
- **📊 Dashboard**: Overview of mood trends, journal entries, and insights
- **😊 Mood Check-in**: Daily mood tracking with emotions and triggers
- **📝 Journal**: Write reflections with templates and prompts
- **🤖 AI Reflections**: Personalized insights based on your entries
- **📈 Analytics**: Visualize mood patterns and trends
- **🔒 Vault**: Private, secure space for sensitive thoughts
- **👤 Profile**: Export data, manage settings, view entry counts

## 🚀 Quick Start

### 1. Install dependencies:
```bash
npm install
```

### 2. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 3. Authentication (Optional - Supabase)

The app works out-of-the-box with localStorage. For production with Supabase:

1. Create project at [supabase.com](https://supabase.com)
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

See [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md) for detailed setup.

## 📚 Documentation

- **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Authentication system overview
- **[AUTH_IMPROVEMENTS.md](./AUTH_IMPROVEMENTS.md)** - Latest auth improvements & fixes
- **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** - Google OAuth setup guide
- **[AUTH_TEST_GUIDE.md](./AUTH_TEST_GUIDE.md)** - Testing guide for auth flows
- **[TEST_AUTH_IMPROVEMENTS.md](./TEST_AUTH_IMPROVEMENTS.md)** - Quick test for new improvements
- **[QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md)** - Supabase setup guide
- **[NEW_FEATURES.md](./NEW_FEATURES.md)** - Latest feature implementations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + localStorage fallback
- **Icons**: Lucide React

## 🎨 Design Philosophy

Ruang Kamu is designed to be:
- **Warm & Personal**: Soft colors, gentle animations, personal tone
- **Privacy-First**: Local data storage, optional cloud sync
- **Non-Judgmental**: Safe space for all emotions
- **Accessible**: Simple, intuitive interface

## 📁 Project Structure

```
src/
├── app/                    # Next.js app routes
│   ├── auth/              # Login/Register page
│   ├── dashboard/         # Main dashboard
│   ├── checkin/           # Mood tracking
│   ├── journal/           # Journal entries
│   ├── analytics/         # Mood analytics
│   ├── reflection/        # AI reflections
│   ├── vault/             # Private vault
│   └── profile/           # User profile
├── components/
│   ├── AuthGuard.tsx      # Route protection
│   ├── layout/            # Navbar, Sidebar, Footer
│   └── ui/                # Reusable UI components
└── lib/
    ├── auth.ts            # Authentication helpers
    ├── supabase.ts        # Supabase client
    └── supabase-service.ts # Data operations
```

## 🔒 Authentication

The app includes a complete authentication system with recent improvements:

- ✅ User registration & login
- ✅ **Google OAuth** - Sign in with Google account
- ✅ **Name persistence** - User names stay correct across sessions
- ✅ **Duplicate email detection** - Prevents re-registration
- ✅ **Smart login validation** - Clear error messages
- ✅ Protected routes (dashboard, checkin, journal, etc.)
- ✅ Logout functionality (desktop & mobile)
- ✅ Form validation with error handling
- ✅ Auto-redirects based on auth state
- ✅ Landing page CTAs redirect to auth
- ✅ Works with Supabase Auth or localStorage

See [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) and [AUTH_IMPROVEMENTS.md](./AUTH_IMPROVEMENTS.md) for details.

## 🧪 Testing

```bash
# Run build (tests TypeScript & compilation)
npm run build

# Check auth flows
# See AUTH_TEST_GUIDE.md for complete test scenarios
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables (if using Supabase)
4. Deploy!

Build works without Supabase credentials (uses placeholders).

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue or submit a PR.

## 📄 License

MIT License - feel free to use for personal projects.

---

Made with {'<3'} for mental wellness

*This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).*
# Deployment timestamp: 2026-06-08 18:05:06
