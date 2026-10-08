'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Plus, Users, Building2, ChevronRight } from 'lucide-react';

interface DashboardData {
  club: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  events: Array<{
    id: string;
    name: string;
    event_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    registrations_count: number;
    checked_in_count: number;
  }>;
}

export default function EventDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/event-dashboard');
        return;
      }
      if (user.role !== 'club_admin') {
        router.push('/events');
        return;
      }
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await apiFetch<{ success: boolean; data: DashboardData }>(
          '/club-admin/dashboard'
        );
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'club_admin') {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Club Header: [Club Logo] Club Name & [+ Create Event] */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          {data.club.logo_url ? (
            <img
              src={data.club.logo_url}
              alt={data.club.name}
              className="h-14 w-14 rounded-2xl object-cover border border-zinc-700 shadow-md"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400">
              <Building2 className="h-7 w-7" />
            </div>
          )}
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-red-500 uppercase">
              Club Administration Portal
            </span>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{data.club.name}</h1>
          </div>
        </div>

        <Link
          href="/event-dashboard/create"
          className="btn-accent inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      {/* Events List */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
          Organized Events ({data.events.length})
        </h2>

        {data.events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <Calendar className="h-10 w-10 text-zinc-600" />
            <h3 className="mt-4 text-base font-medium text-white">No events published yet</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Create your club&apos;s first campus event, contest, or workshop.
            </p>
            <Link
              href="/event-dashboard/create"
              className="btn-accent mt-6 inline-flex items-center gap-2 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121214] p-5 transition-colors duration-150 hover:border-zinc-700"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${event.status === 'published'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {event.event_date} at {event.start_time}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white">{event.name}</h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{event.registrations_count} Registrations</span>
                    </span>
                    <span className="text-emerald-400">
                      {event.checked_in_count} Checked-in
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/events/${event.id}`}
                    className="btn-ghost text-xs font-medium py-2 px-3"
                  >
                    Public Page
                  </Link>

                  <Link
                    href={`/event-dashboard/${event.id}`}
                    className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4"
                  >
                    Manage
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
