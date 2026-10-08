'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Logged in successfully!');
      await refreshUser();

      if (res.user?.role === 'club_admin') {
        router.push('/event-dashboard');
      } else {
        router.push('/events');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-2xl">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white active:scale-90">
            <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
          </Link>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">Sign in to your account</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Or{' '}
            <Link href="/signup" className="text-red-400 transition-colors duration-150 hover:text-red-300">
              create a student profile
            </Link>
          </p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs text-zinc-400">
          <p className="font-medium text-zinc-300 mb-2">Quick Demo Accounts:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('sizan@cityuniversity.edu')}
              className="flex-1 rounded border border-zinc-800 bg-zinc-900 py-1.5 px-2 text-[11px] text-zinc-300 transition-all duration-150 hover:bg-zinc-800 active:scale-90"
            >
              Sizan Molla (Student)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@cpcamp.edu')}
              className="flex-1 rounded border border-zinc-800 bg-zinc-900 py-1.5 px-2 text-[11px] text-zinc-300 transition-all duration-150 hover:bg-zinc-800 active:scale-90"
            >
              CP Camp Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300">Email Address</label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                {...register('email')}
                placeholder="student@university.edu"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Password</label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
