'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { SingleEventDetail } from '@/types/index';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CheckCircle2, Lock, QrCode } from 'lucide-react';

export default function RegisterEventPage({
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
  const [submitting, setSubmitting] = useState(false);

  // Dynamic question answers: map of questionId -> answerText
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    registrationId: string;
    qr_url: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/events/${eventId}/register`);
      return;
    }

    async function loadEvent() {
      try {
        setLoading(true);
        const res = await apiFetch<{ success: boolean; data: SingleEventDetail }>(
          `/events/${eventId}`
        );
        setEvent(res.data);

        // If user already registered, redirect or show QR
        if (res.data.registration_state?.state === 'registered') {
          setRegistrationSuccess({
            registrationId: res.data.registration_state.registration_id!,
            qr_url: res.data.registration_state.qr_url!,
          });
        }
      } catch (err) {
        console.error('Failed to load event for registration', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadEvent();
    }
  }, [eventId, user, authLoading, router]);

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validate required organizer questions
    if (event?.questions) {
      for (const q of event.questions) {
        if (q.is_required && (!answers[q.id] || !answers[q.id].trim())) {
          toast.error(`Please answer required question: "${q.question_text}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payloadAnswers = Object.entries(answers).map(([question_id, answer_text]) => ({
        question_id,
        answer_text,
      }));

      const res = await apiFetch<{
        success: boolean;
        registrationId: string;
        qr_url: string;
        message: string;
      }>(`/events/${eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({ answers: payloadAnswers }),
      });

      toast.success('Successfully registered for the event!');
      setRegistrationSuccess({
        registrationId: res.registrationId,
        qr_url: res.qr_url,
      });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!event || !user) {
    return null;
  }

  // Registration success screen showing the QR code
  if (registrationSuccess) {
    const fullQrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${registrationSuccess.qr_url}`;

    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-white">Registration Confirmed!</h2>
          <p className="mt-1 text-xs text-zinc-400">
            You are officially registered for <span className="font-semibold text-white">{event.name}</span>
          </p>

          <div className="mt-6 flex justify-center rounded-xl bg-white p-5 shadow-md">
            {/* "The QR contains only the URL." */}
            <QRCodeSVG value={fullQrUrl} size={200} level="H" includeMargin={false} />
          </div>

          <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-950 p-2.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">QR Code Destination</p>
            <p className="font-mono text-xs text-zinc-300 break-all">{registrationSuccess.qr_url}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/my-events" className="btn-primary text-xs font-semibold py-2.5">
              View In My Events
            </Link>
            <Link href={`/events/${event.id}`} className="btn-secondary text-xs font-semibold py-2.5">
              Back to Event Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors duration-150 hover:text-white active:scale-90 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-8 shadow-xl">
        <div className="border-b border-zinc-800 pb-6">
          <span className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
            {event.club_name}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white">{event.name}</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Event Date: {event.event_date} at {event.start_time} • {event.venue}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Automatic Profile Fields */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                1. Student Profile Details (Automatic)
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Lock className="h-3 w-3" /> Auto-filled
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3">
                <span className="text-[11px] text-zinc-500">Full Name</span>
                <p className="font-medium text-white">{user.full_name}</p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3">
                <span className="text-[11px] text-zinc-500">Student ID</span>
                <p className="font-medium text-white">{user.student_id}</p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3">
                <span className="text-[11px] text-zinc-500">Department</span>
                <p className="font-medium text-white">{user.department}</p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3">
                <span className="text-[11px] text-zinc-500">Batch</span>
                <p className="font-medium text-white">{user.batch}</p>
              </div>
            </div>
          </div>

          {/* Organizer-Defined Additional Questions */}
          {event.questions && event.questions.length > 0 && (
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                2. Organizer Questions
              </h3>

              <div className="space-y-4">
                {event.questions.map((q, idx) => (
                  <div key={q.id}>
                    <label className="block text-xs font-medium text-zinc-300">
                      {idx + 1}. {q.question_text}{' '}
                      {q.is_required ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-zinc-500">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Your answer..."
                      className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-800 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-accent flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <QrCode className="h-4 w-4" />
              {submitting ? 'Generating Registration Pass...' : 'Confirm Registration & Get QR Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
