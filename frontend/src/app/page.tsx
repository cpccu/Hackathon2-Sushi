import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  BookOpen,
  HelpCircle,
  Search,
  MessageSquare,
  QrCode,
  ShieldCheck,
  GraduationCap,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background radial gradient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[68.4375rem] bg-gradient-to-tr from-red-950/25 via-zinc-900/40 to-transparent opacity-50"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <div className="text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium text-white">City University</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">CampusOS Digital Hub</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
            One unified platform for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              City University campus life.
            </span>
          </h1>

          {/* University-Specific Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Designed for students, faculty, and club administrators.
            Register for club events with instant QR passes, access peer-reviewed academic
            resources, resolve campus complaints, and navigate administrative procedures in one place.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/events"
              className="btn-primary inline-flex items-center gap-2 text-sm font-semibold shadow-md shadow-white/5"
            >
              <Calendar className="h-4 w-4" />
              <span>Explore Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/resources"
              className="btn-secondary inline-flex items-center gap-2 text-sm font-semibold"
            >
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <span>Academic Vault</span>
            </Link>
            <Link
              href="/helpdesk"
              className="btn-secondary inline-flex items-center gap-2 text-sm font-semibold"
            >
              <HelpCircle className="h-4 w-4 text-zinc-400" />
              <span>Helpdesk Guides</span>
            </Link>
          </div>

          {/* Campus Location & Portals Quick Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 border-y border-zinc-800/80 py-3.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span>Khagan, Ashulia Campus</span>
            </div>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <a
              href="https://iems.cityuniversity.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
            >
              <GraduationCap className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span>iEMS Portal</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Core Services Grid */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Centralized Services
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                Everything you need for your campus journey
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Events & Competitions */}
            <Link
              href="/events"
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-[#121214] active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    All Clubs
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Campus Events &amp; Passes
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Participate in hackathons, robotics challenges, sports meets, and seminars across all City University clubs.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-zinc-800/40">
                <span>Browse upcoming events</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Academic Resources */}
            <Link
              href="/resources"
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-[#121214] active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Vault
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Academic Resources
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Access midterm &amp; final exam archives, course slides, and syllabus guides categorized by department.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-zinc-800/40">
                <span>Access study materials</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: Helpdesk Guides */}
            <Link
              href="/helpdesk"
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-[#121214] active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Step-by-Step
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Campus Helpdesk Guides
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Step-by-step procedures for course drop/add, tuition waiver submission, semester clearance, and office desks.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-zinc-800/40">
                <span>View verified guides</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 4: Lost & Found */}
            <Link
              href="/lost-found"
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-[#121214] active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Active Board
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Lost &amp; Found Board
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Report or recover misplaced student IDs, keys, calculators, and laptops found across Ashulia campus facilities.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-zinc-800/40">
                <span>Search noticeboard</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 5: Complaints & Grievances */}
            <Link
              href="/complaints"
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6 transition-all duration-200 hover:border-zinc-700 hover:bg-[#121214] active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    Official
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  Complaints &amp; Inquiries
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Submit academic or campus facility concerns directly to Helpdesk Administrators anonymously.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-300 group-hover:text-white pt-2 border-t border-zinc-800/40">
                <span>View complaint board</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 6: Contactless QR Check-In / Admin */}
            <div className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-[#121214]/60 p-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-red-500">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                    Instant
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">
                  Fast QR Ticket Check-In
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Instant ticket generation on mobile. Club admins scan and verify attendee passes at the hall entrance in seconds.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/40">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paperless passes
                </span>
                <span className="text-zinc-400">Zero entrance queues</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - Minimalist 3-Step Section */}
        <div className="mt-24 border-t border-zinc-900 pt-16">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              How City University students use CampusOS
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Designed with simplicity and speed so you spend less time browsing and more time learning.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 relative">
              <div className="text-xs font-mono font-bold text-red-500 mb-2">01</div>
              <h3 className="text-sm font-semibold text-white">Sign In with Credentials</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Access your account to register for events, upload resources, and manage your campus activities.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 relative">
              <div className="text-xs font-mono font-bold text-red-500 mb-2">02</div>
              <h3 className="text-sm font-semibold text-white">Engage &amp; Register</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Join competitions, download verified course slides, review campus protocols, or post lost property alerts.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 relative">
              <div className="text-xs font-mono font-bold text-red-500 mb-2">03</div>
              <h3 className="text-sm font-semibold text-white">Instant Verification</h3>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Receive digital QR passes for events, track responses to grievances, and get notified on recovered items.
              </p>
            </div>
          </div>
        </div>

        {/* Institutional Callout / Portal Gateway */}
        <div className="mt-20 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official Student Infrastructure</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to take part in City University activities?
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Join fellow students across engineering, business, and arts. Stay informed on campus deadlines and club events.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/events"
                className="btn-accent text-xs font-semibold px-4 py-2"
              >
                View Live Events
              </Link>

            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
