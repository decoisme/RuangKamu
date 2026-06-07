"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { motion } from "framer-motion";

// Protected routes yang require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/checkin',
  '/journal',
  '/analytics',
  '/reflection',
  '/vault',
  '/profile',
];

// Public routes yang accessible tanpa auth
const PUBLIC_ROUTES = [
  '/',
  '/auth',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '/');

      setIsAuthed(authenticated);

      // Jika user sudah login dan di page public, allow
      if (authenticated && isPublicRoute) {
        setIsChecking(false);
        return;
      }

      // Jika route protected dan user belum login, redirect ke auth
      if (isProtectedRoute && !authenticated) {
        router.push('/auth');
        return;
      }

      // Jika user sudah login dan coba akses /auth, redirect ke dashboard
      if (authenticated && pathname === '/auth') {
        router.push('/dashboard');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-black/10 border-t-[#0a0a0a] rounded-full"
        />
      </div>
    );
  }

  return <>{children}</>;
}
