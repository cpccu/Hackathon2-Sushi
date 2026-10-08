'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, CheckCircle2, Clock, MapPin, QrCode, X } from 'lucide-react';

interface MyEventItem {
  registration_id: string;
  registration_status: 'registered' | 'checked_in' | 'cancelled';
  checked_in_at: string | null;
  registered_at: string;
  event_id: string;
  event_name: string;
  cover_image_url: string | null;
  category: string;
  venue: string;
  event_date: string;
  start_time: string;
  duration_minutes: number;
  club_id: string;
  club_name: string;
  club_logo_url: string | null;
  qr_url: string;
}

export default function MyEventsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<MyEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState<{ eventName: string; qrUrl: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-events');
      return;
    }

    async function loadMyEvents() {
      try {
        setLoading(true);
        const res = await apiFetch<{ success: boolean; data: MyEventItem[] }>('/events/my-events');
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to load my events', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadMyEvents();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">My Event Passes</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Showing events you are registered for. Present your QR code at the event entrance for fast check-in.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <Calendar className="h-10 w-10 text-zinc-600" />
          <h3 className="mt-4 text-base font-medium text-white">No registered events yet</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            You have not registered for any upcoming events. Explore active competitions and activities now.
          </p>
          <Link href="/events" className="btn-primary mt-6 text-xs font-semibold">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {events.map((item) => (
            <div
              key={item.registration_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-xl border border-zinc-800 bg-[#121214] p-5 shadow-sm hover:border-zinc-700 transition-colors duration-150"
            >
              <div className="flex items-start gap-4">
                {item.cover_image_url ? (
                  <img
                    src={item.cover_image_url}
                    alt={item.event_name}
                    className="h-20 w-28 rounded-lg object-cover border border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-semibold text-red-500">
                      {item.club_name}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        item.registration_status === 'checked_in'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {item.registration_status === 'checked_in' ? 'Checked In' : 'Registered'}
                    </span>
                  </div>

                  <Link
                    href={`/events/${item.event_id}`}
                    className="text-base font-semibold text-white hover:text-red-400 transition-colors duration-150"
                  >
                    {item.event_name}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {item.event_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-zinc-500" />
                      {item.start_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {item.venue}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Action Button */}
              <div className="shrink-0 flex items-center gap-3 sm:self-center">
                <button
                  onClick={() =>
                    setSelectedQr({
                      eventName: item.event_name,
                      qrUrl: item.qr_url,
                    })
                  }
                  className="btn-primary flex items-center gap-2 text-xs font-semibold py-2 px-4"
                >
                  <QrCode className="h-4 w-4 text-red-500" />
                  View QR Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#121214] p-6 text-center shadow-2xl">
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white">{selectedQr.eventName}</h3>
            <p className="mt-1 text-xs text-zinc-400">Scan at entrance for immediate check-in</p>

            <div className="mt-6 flex justify-center rounded-xl bg-white p-5 shadow-inner">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}${selectedQr.qrUrl}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="mt-4 font-mono text-[11px] text-zinc-500 break-all">{selectedQr.qrUrl}</p>

            <button
              onClick={() => setSelectedQr(null)}
              className="btn-secondary mt-6 w-full text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
