'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

interface CheckInData {
  registration_id: string;
  registration_status: 'registered' | 'checked_in' | 'cancelled';
  checked_in_at: string | null;
  student: {
    id: string;
    full_name: string;
    student_id: string | null;
    department: string | null;
    batch: string | null;
    email: string;
  };
  event: {
    id: string;
    name: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    venue: string;
    club_id: string;
    club_name: string;
  };
  is_admin_authorized?: boolean;
}

export default function CheckInPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const resolvedParams = use(params);
  const registrationId = resolvedParams.registrationId;

  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<CheckInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    async function loadRegistration() {
      try {
        setLoading(true);
        const res = await apiFetch<{ success: boolean; data: CheckInData }>(
          `/check-in/${registrationId}`
        );
        setData(res.data);
      } catch (err: any) {
        toast.error(err.message || 'Invalid or missing registration QR pass');
      } finally {
        setLoading(false);
      }
    }

    loadRegistration();
  }, [registrationId, user]);

  const handleCheckIn = async () => {
    if (!user) {
      toast.error('You must log in as the event club administrator to perform check-in');
      return;
    }

    setCheckingIn(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        registration: { id: string; status: 'checked_in'; checked_in_at: string };
      }>(`/check-in/${registrationId}`, {
        method: 'POST',
      });

      toast.success('Student successfully checked in!');
      setData((prev) =>
        prev
          ? {
            ...prev,
            registration_status: 'checked_in',
            checked_in_at: res.registration.checked_in_at,
          }
          : null
      );
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-zinc-600" />
        <h2 className="mt-4 text-lg font-bold text-white">Invalid Ticket QR</h2>
        <p className="mt-2 text-xs text-zinc-400">
          This registration ID could not be found or has been revoked.
        </p>
        <Link href="/events" className="btn-secondary mt-6 text-xs font-semibold">
          Browse Events
        </Link>
      </div>
    );
  }

  const isCheckedIn = data.registration_status === 'checked_in';

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl">
        {/* Verification Status Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${isCheckedIn
              ? 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-300'
            }`}
        >
          <div className="flex items-center gap-2">
            {isCheckedIn ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-zinc-400" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isCheckedIn ? 'Checked-In Attendee' : 'Valid Registration Pass'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-zinc-500">
            Pass #{data.registration_id.slice(0, 8)}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Event Context */}
          <div className="border-b border-zinc-800 pb-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500">
              {data.event.club_name}
            </span>
            <h1 className="mt-1 text-xl font-bold text-white">{data.event.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                {data.event.event_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                {data.event.start_time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                {data.event.venue}
              </span>
            </div>
          </div>

          {/* Student Verification Details per specification:
              Student
              Student ID
              Department
              Batch
              Registration Status
          */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Student Information
            </h3>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-400">Student Name</span>
                <span className="font-semibold text-white">{data.student.full_name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-400">Student ID</span>
                <span className="font-mono font-bold text-white">{data.student.student_id || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-400">Department</span>
                <span className="font-medium text-white">{data.student.department || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <span className="text-zinc-400">Batch</span>
                <span className="font-medium text-white">{data.student.batch || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400">Registration Status</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isCheckedIn
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                >
                  {data.registration_status}
                </span>
              </div>
            </div>
          </div>

          {isCheckedIn && data.checked_in_at && (
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3 text-center text-xs text-emerald-400">
              Verified & Checked-in at: {new Date(data.checked_in_at).toLocaleTimeString()}
            </div>
          )}

          {/* Check-In Action Button */}
          <div className="pt-2">
            {isCheckedIn ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 py-3 text-center text-xs font-semibold text-zinc-400">
                Attendee is already checked in
              </div>
            ) : (
              <div>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="btn-accent flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-50 "
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {checkingIn ? 'Verifying check-in...' : 'Check In'}
                </button>

                {!user && (
                  <p className="mt-2 text-center text-[11px] text-zinc-500">
                    Staff note: Club admin login is required to authorize attendee check-in.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
