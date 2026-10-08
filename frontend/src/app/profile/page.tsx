'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DEPARTMENTS } from '@/lib/constants';
import { Lock, Save, User as UserIcon, Shield, Building2 } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  department: z.string().min(1, 'Department cannot be empty'),
  batch: z.string().min(1, 'Batch cannot be empty'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        department: user.department || '',
        batch: user.batch || '',
      });
    }
  }, [user, authLoading, router, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      toast.success('Profile details updated successfully');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300">
            {user.role === 'club_admin' ? (
              <Shield className="h-6 w-6 text-red-500" />
            ) : (
              <UserIcon className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {user.role === 'club_admin'
                ? 'Club Administrator Profile'
                : user.role === 'helpdesk_admin'
                ? 'Helpdesk Administrator Profile'
                : 'Student Profile'}
            </h1>
            <p className="text-xs text-zinc-400">
              {user.role === 'club_admin'
                ? `Official administrative profile for ${user.club_name || 'Club Administration'}`
                : 'View and update your personal university details'}
            </p>
          </div>
        </div>

        {/* Prominent Respective Club Banner for Club Admin */}
        {user.role === 'club_admin' && (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 mt-0.5">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Respective Club (Full Name)
                  </span>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-300">
                    Administrator
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                  {user.club_name || 'No Club Assigned'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  You have authorized administrator privileges to create events, manage details, and scan participant check-ins for this club.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* Club full name field for club_admin */}
          {user.role === 'club_admin' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400">
                Assigned Club Full Name
              </label>
              <input
                type="text"
                disabled
                value={user.club_name || 'No Club Assigned'}
                className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-red-500/30 bg-zinc-950 px-3.5 py-2.5 text-sm text-white font-semibold opacity-95"
              />
            </div>
          )}

          {/* Immutable Student ID */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-400">
                {user.role === 'club_admin' ? 'Student ID' : 'Student ID (Immutable)'}
              </label>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Lock className="h-3 w-3" /> Locked
              </span>
            </div>
            <input
              type="text"
              disabled
              value={user.student_id || (user.role === 'club_admin' ? 'N/A (Club Administrator)' : 'N/A')}
              className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-400 opacity-80"
            />
            {user.role === 'student' && (
              <p className="mt-1 text-[11px] text-zinc-600">
                Your Student ID cannot be modified once set.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Full Name</label>
            <input
              type="text"
              {...register('full_name')}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Department</label>
              <select
                {...register('department')}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
              <label className="block text-xs font-medium text-zinc-300">Batch</label>
              <input
                type="text"
                {...register('batch')}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              {errors.batch && <p className="mt-1 text-xs text-red-400">{errors.batch.message}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
