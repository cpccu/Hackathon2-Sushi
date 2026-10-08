'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Participant } from '@/types/index';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  MapPin,
  Save,
  Search,
  Users,
} from 'lucide-react';
import { formatDateDDMMYYYY, formatTime12Hour, formatDurationHours } from '@/lib/formatters';

interface EventParticipantsResponse {
  event: {
    id: string;
    name: string;
    club_id: string;
    club_name: string;
  };
  registered_count: number;
  checked_in_count: number;
  participants: Participant[];
}

export default function ManageEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields per specifications:
  // "Only these fields are editable: Name, Description, Date, Start Time, Duration"
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'ongoing' | 'finished' | 'cancelled'>('upcoming');

  // Participants data
  const [participantsData, setParticipantsData] = useState<EventParticipantsResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<Array<{ question: string; answer: string }> | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'club_admin')) {
      router.push('/events');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        // Load event detail
        const eventRes = await apiFetch(`/events/${eventId}`);
        setName(eventRes.data.name);
        setDescription(eventRes.data.description);
        setEventDate(eventRes.data.event_date);
        setStartTime(eventRes.data.start_time?.slice(0, 5) || '');
        setDurationHours(eventRes.data.duration_minutes / 60);
        setEventStatus(eventRes.data.status ?? 'upcoming');

        // Load participants
        const participantsRes = await apiFetch(
          `/club-admin/events/${eventId}/participants`
        );
        setParticipantsData(participantsRes.data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'club_admin') {
      loadData();
    }
  }, [eventId, user, authLoading, router]);

  // Handle participant search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<EventParticipantsResponse>(
        `/club-admin/events/${eventId}/participants`,
        { params: { search: searchQuery } }
      );
      setParticipantsData(res);
    } catch (err: any) {
      toast.error('Search failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/club-admin/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          description,
          event_date: eventDate,
          start_time: startTime,
          duration_minutes: Math.round(durationHours * 60),
        }),
      });

      toast.success('Event updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-CA');

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  console.log(participantsData)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back and Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div>
          <Link
            href="/event-dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors duration-150 hover:text-white active:scale-90 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Manage Event</h1>
        </div>

        <Link
          href={`/events/${eventId}`}
          target="_blank"
          className="btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3.5 self-start sm:self-auto"
        >
          View Public Event Page
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Section 1: Event Details — editable only when upcoming */}
      {eventStatus === 'upcoming' ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h2 className="text-base font-semibold text-white">Editable Event Details</h2>
            <p className="text-xs text-zinc-400">
              Per policy, only name, description, date, start time, and duration are modifiable once published.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300">Event Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300">Date</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white [color-scheme:dark] focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300">Duration (Hours)</label>
                <input
                  type="number"
                  required
                  min={0.25}
                  step={0.25}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2 py-2 px-5 text-xs font-semibold disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read-only view for ongoing / finished / cancelled events */
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Event Details</h2>
              <p className="text-xs text-zinc-500 mt-0.5">This event is locked and can no longer be edited.</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border ${eventStatus === 'ongoing'
                ? 'bg-blue-950/60 text-blue-300 border-blue-800/50'
                : eventStatus === 'finished'
                  ? 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  : 'bg-red-950/60 text-red-300 border-red-800/50'
                }`}
            >
              <Lock className="h-3 w-3" />
              {eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Event Name</p>
              <p className="mt-1 text-sm font-semibold text-white">{name}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Description</p>
              <p className="mt-1 text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Date</p>
                <p className="mt-1 text-xs font-medium text-white flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  {formatDateDDMMYYYY(eventDate)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Start Time</p>
                <p className="mt-1 text-xs font-medium text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  {formatTime12Hour(startTime)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Duration</p>
                <p className="mt-1 text-xs font-medium text-white">
                  {formatDurationHours(durationHours * 60)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Participants & Check-In Management */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Registered Participants</h2>
            <p className="text-xs text-zinc-400">Search attendees and review check-in verification statuses.</p>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-1.5 text-xs">
              <span className="text-zinc-500">Registered: </span>
              <span className="font-semibold text-white">{participantsData?.registered_count || 0}</span>
            </div>
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3.5 py-1.5 text-xs text-emerald-400">
              <span className="text-emerald-500">Checked-in: </span>
              <span className="font-semibold text-emerald-300">{participantsData?.checked_in_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or Student ID..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-secondary py-2 px-3 text-xs">
            Search
          </button>
        </form>

        {/* Participants Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-[#121214]">
              {!participantsData?.participants || participantsData.participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No matching participants registered yet.
                  </td>
                </tr>
              ) : (
                participantsData.participants.map((p) => (
                  <tr key={p.registration_id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-white">{p.full_name}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-400">{p.student_id || 'N/A'}</td>
                    <td className="px-4 py-3.5">{p.department || 'N/A'}</td>
                    <td className="px-4 py-3.5">{p.batch || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.registration_status === 'checked_in'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                      >
                        {p.registration_status === 'checked_in' ? 'Checked In' : 'Registered'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {p.answers && p.answers.length > 0 && (
                        <button
                          onClick={() => setSelectedAnswers(p.answers)}
                          className="btn-ghost py-1 px-2 text-[11px]"
                        >
                          Answers ({p.answers.length})
                        </button>
                      )}

                      <Link
                        href={`/check-in/${p.registration_id}`}
                        target="_blank"
                        className="btn-secondary py-1 px-2.5 text-[11px]"
                      >
                        Check-in Desk
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answers Modal */}
      {selectedAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Dynamic Question Answers</h3>
            <div className="space-y-3">
              {selectedAnswers.map((ans, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs">
                  <p className="font-semibold text-zinc-300">{ans.question}</p>
                  <p className="mt-1 text-white">{ans.answer}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedAnswers(null)}
              className="btn-secondary w-full text-xs py-2 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
