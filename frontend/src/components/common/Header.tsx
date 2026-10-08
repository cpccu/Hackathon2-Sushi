'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  User as UserIcon,
  Calendar,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Shield,
  Sparkles,
  BookOpen,
  FolderOpen,
  PackageSearch,
} from 'lucide-react';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close sidebar when navigation occurs
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Handle escape key and lock body scroll when sidebar is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };

    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white transition-opacity duration-150 active:scale-95"
            >
              <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden items-center space-x-6 md:flex">
              <Link
                href="/events"
                className="text-sm font-medium text-zinc-300 transition-colors duration-150 hover:text-white active:scale-95"
              >
                Events
              </Link>
              <Link
                href="/resources"
                className="text-sm font-medium text-zinc-300 transition-colors duration-150 hover:text-white active:scale-95"
              >
                Resources
              </Link>
              <Link
                href="/lost-found"
                className="text-sm font-medium text-zinc-300 transition-colors duration-150 hover:text-white active:scale-95"
              >
                Lost & Found
              </Link>
            </nav>
          </div>

          {/* User / Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-zinc-800" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.role === 'club_admin' ? (
                  <Link
                    href="/event-dashboard"
                    title="Admin Dashboard"
                    className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-95 shrink-0"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/my-events"
                    title="My Events"
                    className="hidden sm:flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-95 shrink-0"
                  >
                    <Calendar className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    My Events
                  </Link>
                )}

                <Link
                  href="/my-resources"
                  title="My Resources"
                  className="hidden sm:flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-95 shrink-0"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  My Resources
                </Link>

                <Link
                  href="/my-posts"
                  title="My Posts"
                  className="hidden sm:flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-95 shrink-0"
                >
                  <PackageSearch className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  My Posts
                </Link>

                {/* Profile - desktop only in header to prevent crowding on mobile */}
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-150 hover:bg-zinc-800 hover:text-white active:scale-95"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>

                {/* Logout - desktop only in header */}
                <button
                  onClick={logout}
                  title="Logout"
                  className="hidden md:flex rounded-md p-1.5 text-zinc-400 transition-all duration-150 hover:bg-zinc-800 hover:text-red-400 active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-150 hover:text-white active:scale-95"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex rounded-md border border-zinc-800 bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition-all duration-150 hover:bg-zinc-200 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex md:hidden rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2 text-zinc-300 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay & Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 hidden">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col justify-between border-l border-zinc-800 bg-[#0f0f12] p-6 shadow-2xl transition-transform animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Top / Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="text-lg font-bold tracking-tight text-white"
                >
                  <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-400 hover:border-zinc-700 hover:text-white active:scale-95 cursor-pointer transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Profile Card (if logged in) */}
              {user && (
                <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
                      <p className="truncate text-xs text-zinc-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                      {user.role === 'club_admin' ? (
                        <>
                          <Shield className="h-3 w-3 text-red-400" />
                          Club Admin
                        </>
                      ) : (
                        'Student'
                      )}
                    </span>
                    {user.student_id && (
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {user.student_id}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Navigation
                </p>

                <Link
                  href="/events"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-red-500" />
                    Browse Events
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </Link>

                <Link
                  href="/resources"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-red-500" />
                    Academic Resources
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </Link>

                <Link
                  href="/lost-found"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <PackageSearch className="h-4 w-4 text-red-500" />
                    Lost & Found
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </Link>

                {user?.role === 'club_admin' && (
                  <Link
                    href="/event-dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-red-300 bg-red-950/20 border border-red-900/30 transition-all hover:bg-red-950/40"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-red-400" />
                      Admin Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-red-400" />
                  </Link>
                )}

                {user && user.role !== 'club_admin' && (
                  <Link
                    href="/my-events"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 " />
                      My Registered Events
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                )}

                {user && (
                  <Link
                    href="/my-resources"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <FolderOpen className="h-4 w-4 text-zinc-400" />
                      My Shared Resources
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                )}

                {user && (
                  <Link
                    href="/my-posts"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <PackageSearch className="h-4 w-4 text-zinc-400" />
                      My Lost & Found Posts
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                )}

                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800/60 hover:text-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                      My Profile
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </Link>
                )}

              </div>
            </div>

            {/* Sidebar Bottom Actions */}
            <div className="border-t border-zinc-800/80 pt-4">
              {user ? (
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-950/60 bg-red-950/20 px-4 py-2.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-950/40 hover:text-red-300 active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setSidebarOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setSidebarOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
