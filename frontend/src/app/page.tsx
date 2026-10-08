import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, QrCode, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[68.4375rem] bg-gradient-to-tr from-red-950/20 via-zinc-900 to-zinc-950 opacity-40"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Campus Event Hub & Verification System</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Where campus ideas meet <br className="hidden sm:inline" />
            <span className="text-zinc-400">seamless execution.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Discover hackathons, rover battles, cultural summits, and academic debates across all university clubs.
            Instant registration verification and real-time QR ticketing.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/events"
              className="btn-primary inline-flex items-center gap-2 text-sm font-semibold"
            >
              Browse Events
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/resources"
              className="btn-secondary inline-flex items-center gap-2 text-sm font-semibold"
            >
              Academic Resources
            </Link>
            <Link
              href="/signup"
              className="btn-secondary text-sm font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-150 hover:border-zinc-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">Dynamic Event Catalog</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Filtered by department eligibility, club categories, and batch requirements with real-time availability.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-150 hover:border-zinc-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">Instant QR Ticketing</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Automatic pass generation upon registration. Zero printed paperwork needed at the entrance.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-150 hover:border-zinc-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">Club Admin Portal</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Live attendee rosters, custom question builders, attendee counts, and secure check-in validation.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-150 hover:border-zinc-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">Resource Sharing</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Past questions, lecture slides, and handwritten notes rated by student upvotes and downvotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
