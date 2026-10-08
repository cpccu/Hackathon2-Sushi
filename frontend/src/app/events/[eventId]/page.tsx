'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '@/lib/api';
import { SingleEventDetail } from '@/types/index';
import { useAuth } from '@/context/AuthContext';
import { formatDurationHours } from '@/lib/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  ShieldCheck,
  Building2,
  QrCode,
  ArrowRight,
  AlertCircle,
  X,
} from 'lucide-react';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<SingleEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await apiFetch<{ success: boolean; data: SingleEventDetail }>(
          `/events/${eventId}`
        );
        setEvent(res.data);
      } catch (err) {
        console.error('Failed to load event details', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="mt-2 text-xs text-zinc-400">The requested event could not be found or has been removed.</p>
        <Link href="/events" className="btn-secondary mt-6 text-xs">
          Back to Events
        </Link>
      </div>
    );
  }

  const regState = event.registration_state?.state || 'login';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Cover Image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
            <Calendar className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-black/60 px-2.5 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-sm">
                {event.category}
              </span>
              <span
                className={`rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${event.status === 'ongoing'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : event.status === 'upcoming'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-700'
                  }`}
              >
                {event.status}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {event.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Description & Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Club Info */}
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#121214] p-4">
            {event.club_logo_url ? (
              <img
                src={event.club_logo_url}
                alt={event.club_name}
                className="h-10 w-10 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <Building2 className="h-8 w-8 text-zinc-500" />
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400">Organized By</p>
              <h3 className="text-sm font-semibold text-white">{event.club_name}</h3>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-zinc-800 bg-[#121214] p-6">
            <h3 className="text-sm font-semibold text-white">Event Overview</h3>
            <p className="mt-3 text-xs leading-relaxed text-zinc-300 sm:text-sm whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Participation Requirements */}
          <div className="rounded-xl border border-zinc-800 bg-[#121214] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Participation Requirements</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <p className="font-medium text-zinc-400">Eligible Departments</p>
                <p className="mt-1 font-semibold text-white">
                  {event.allowed_departments && event.allowed_departments.length > 0
                    ? event.allowed_departments.join(', ')
                    : 'All University Departments'}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5">
                <p className="font-medium text-zinc-400">Eligible Batches</p>
                <p className="mt-1 font-semibold text-white">
                  {event.allowed_batches && event.allowed_batches.length > 0
                    ? event.allowed_batches.join(', ')
                    : 'Open to All Batches'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Register Action Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121214] p-6 shadow-md space-y-5">
            <h3 className="text-sm font-semibold text-white">Event Schedule</h3>

            <div className="space-y-3.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{event.event_date}</p>
                  <p className="text-[11px] text-zinc-500">Scheduled Date</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-white">
                    {new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })} ({formatDurationHours(event.duration_minutes)})
                  </p>
                  <p className="text-[11px] text-zinc-500">Start Time & Duration</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{event.venue}</p>
                  <p className="text-[11px] text-zinc-500">Venue / Location</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-zinc-800 pt-3">
                <Mail className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="font-medium text-red-400 hover:underline"
                  >
                    {event.contact_email}
                  </a>
                  <p className="text-[11px] text-zinc-500">Contact Gmail</p>
                </div>
              </div>
            </div>

            {/* Registration Window Notice */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3 text-[11px] text-zinc-400 space-y-1">
              <p>
                <span className="text-zinc-300">Registration Opens:</span>{' '}
                {new Date(event.registration_start).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).replace(",", "")}
              </p>
              <p>
                <span className="text-zinc-300">Deadline:</span>{' '}
                {new Date(event.registration_deadline).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).replace(",", "")}
              </p>
            </div>

            {/* Registration Action states per specifications:
                Not logged in → Login
                Eligible + open → Register
                Ineligible → hide Register
                Closed → Registration Closed
                Registered → Show QR
            */}
            <div className="pt-2">
              {regState === 'login' && (
                <Link
                  href="/login"
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold"
                >
                  Sign In to Register
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {regState === 'eligible_open' && (
                <Link
                  href={`/events/${event.id}/register`}
                  className="btn-accent flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {regState === 'registered' && (
                <button
                  onClick={() => setShowQrModal(true)}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold"
                >
                  <QrCode className="h-4 w-4 text-red-500" />
                  Show My Entry QR Code
                </button>
              )}

              {regState === 'closed' && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 text-center text-xs font-medium text-zinc-500">
                  Registration Closed
                </div>
              )}

              {regState === 'ineligible' && (
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-400">
                  <AlertCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span>
                    {event.registration_state?.reason ||
                      'You do not meet the department or batch criteria for this event.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Registered Students */}
      {showQrModal && event.registration_state?.qr_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#121214] p-6 text-center shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white">Your Check-In QR Pass</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Present this QR to authorized club staff at the entrance
            </p>

            <div className="mt-6 flex justify-center rounded-xl bg-white p-5 shadow-inner">
              {/* "The QR contains only the URL." */}
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}${event.registration_state.qr_url}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="mt-4 font-mono text-[11px] text-zinc-500 break-all">
              {event.registration_state.qr_url}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="btn-secondary mt-6 w-full text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
