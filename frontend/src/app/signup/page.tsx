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
import { ArrowRight, Info } from 'lucide-react';

const signupSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    student_id: z.string().min(3, 'Student ID is required and will be permanent'),
    email: z.string().email('Please enter a valid email address'),
    department: z.string().min(2, 'Department is required'),
    batch: z.string().min(1, 'Batch is required (e.g., 2021, 2022)'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

import { DEPARTMENTS } from '@/lib/constants';

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toast.success('Account created successfully! Welcome to campusOS.');
      await refreshUser();
      router.push('/events');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-2xl">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white active:scale-90">
            <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
          </Link>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">Create your student profile</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Already registered?{' '}
            <Link href="/login" className="text-red-400 transition-colors duration-150 hover:text-red-300">
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-red-950/50 bg-red-950/20 p-3 text-xs text-red-300">
          <Info className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>Note: Student ID is permanent and immutable once registered to protect ticket verification integrity.</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Full Name *</label>
              <input
                type="text"
                {...register('full_name')}
                placeholder="John Doe"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Student ID *</label>
              <input
                type="text"
                {...register('student_id')}
                placeholder="2021-1-60-001"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.student_id && <p className="mt-1 text-xs text-red-400">{errors.student_id.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Email Address *</label>
            <input
              type="email"
              {...register('email')}
              placeholder="student@university.edu"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Department *</label>
              <select
                {...register('department')}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="mt-1 text-xs text-red-400">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Batch *</label>
              <input
                type="text"
                {...register('batch')}
                placeholder="e.g. 2021"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.batch && <p className="mt-1 text-xs text-red-400">{errors.batch.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Password *</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Confirm Password *</label>
              <input
                type="password"
                {...register('confirm_password')}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-400">{errors.confirm_password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Complete Registration'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
