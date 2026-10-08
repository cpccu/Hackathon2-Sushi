'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  HelpCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';

// Custom Facebook SVG Icon for consistent branding
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className || 'h-4 w-4'}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type LegalModalType = 'terms' | 'privacy' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  return (
    <footer className="w-full border-t border-zinc-900 bg-[#09090b] text-zinc-400">
      {/* Main Footer Container */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* SECTION 1: CampusOS / Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="text-xl font-bold tracking-tight text-white active:scale-95 transition-transform">
                <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
              </Link>
              <span className="h-4 w-px bg-zinc-800" />
              <span className="text-sm font-medium text-zinc-400 flex items-center">
                City University
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              CampusOS is a unified digital campus hub for City University students, bringing campus events, resources, helpdesk information, lost &amp; found, and other essential services into one place.
            </p>

            <div className="pt-2">
              <a
                href="https://cityuniversity.ac.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white group"
              >
                <Globe className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                <span>cityuniversity.ac.bd</span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* SECTION 2: Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-white group"
                >
                  <Calendar className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-white group"
                >
                  <BookOpen className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  <span>Resources</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/helpdesk"
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-white group"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  <span>Helpdesk</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/lost-found"
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-white group"
                >
                  <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  <span>Lost &amp; Found</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/complaints"
                  className="inline-flex items-center gap-2 transition-colors duration-150 hover:text-white group"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                  <span>Complaints</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* SECTION 3: Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Contact
            </h4>
            <div className="mt-4 space-y-3.5 text-xs">
              {/* Phone */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Phone className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Phone</span>
                </div>
                <div className="pl-5 space-y-0.5 text-zinc-400">
                  <div>
                    <span className="text-zinc-500">Tel: </span>
                    <a
                      href="tel:09643234234"
                      className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      09643-234234
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500">Cell: </span>
                    <a
                      href="tel:+8801322917670"
                      className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      +8801322917670
                    </a>
                    ,{' '}
                    <a
                      href="tel:+8801322917671"
                      className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      +8801322917671
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500">Cell: </span>
                    <a
                      href="tel:+8801322917672"
                      className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      +8801322917672
                    </a>
                    ,{' '}
                    <a
                      href="tel:+8801322917673"
                      className="hover:text-white transition-colors underline-offset-2 hover:underline"
                    >
                      +8801322917673
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Mail className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Email</span>
                </div>
                <div className="pl-5 flex flex-col space-y-0.5">
                  <a
                    href="mailto:registrar@cityuniversity.ac.bd"
                    className="hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    registrar@cityuniversity.ac.bd
                  </a>
                  <a
                    href="mailto:info@cityuniversity.ac.bd"
                    className="hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    info@cityuniversity.ac.bd
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span>Location</span>
                </div>
                <p className="pl-5 text-zinc-400 leading-snug">
                  Khagan, Ashulia, Birulia, Savar, Dhaka, Bangladesh
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Connect & Legal */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Connect &amp; Portals
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <a
                    href="https://iems.cityuniversity.ac.bd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-zinc-300 transition-colors duration-150 hover:text-white group"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                    <span>Student Portal (iEMS)</span>
                    <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://cityuniversity.ac.bd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-zinc-300 transition-colors duration-150 hover:text-white group"
                  >
                    <Globe className="h-3.5 w-3.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                    <span>City University Website</span>
                    <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/share/19q9Bp4FpB/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-zinc-300 transition-colors duration-150 hover:text-white group"
                  >
                    <FacebookIcon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                    <span>Facebook Page</span>
                    <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/share/g/1CFQzfTb1t/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-zinc-300 transition-colors duration-150 hover:text-white group"
                  >
                    <Users className="h-3.5 w-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                    <span>Facebook Group</span>
                    <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Mobile Legal */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-zinc-900 pt-6 text-xs text-zinc-500 sm:flex-row gap-4">
          <p className="text-center sm:text-left">
            © 2026 CampusOS — City University. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-xs text-zinc-500">
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span className="text-zinc-800">•</span>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Interactive Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-semibold text-white">
                  {activeModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-3 max-h-[60vh] overflow-y-auto pr-1 leading-relaxed">
              {activeModal === 'terms' ? (
                <>
                  <p>
                    Welcome to <strong>CampusOS</strong>, the official digital campus ecosystem for City University. By accessing or using CampusOS, you agree to comply with and be bound by the university&#39;s student conduct and IT usage policies.
                  </p>
                  <p>
                    <strong>Acceptable Use:</strong> CampusOS is dedicated to student services including campus event registrations, verified academic resources, official helpdesk inquiries, lost &amp; found notices, and administrative complaints. Misrepresentation, posting fraudulent items, or improper conduct will result in account suspension and referral to the Proctorial Board.
                  </p>
                  <p>
                    <strong>Event Registrations &amp; Passes:</strong> Ticket passes and QR codes are non-transferable and tied to your university student credentials.
                  </p>
                  <p>
                    For inquiries regarding terms of service, reach out to the Registrar&#39;s Office at{' '}
                    <a href="mailto:registrar@cityuniversity.ac.bd" className="text-red-400 underline">
                      registrar@cityuniversity.ac.bd
                    </a>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    City University and CampusOS take student privacy seriously. This policy explains how we collect and manage your information across the platform.
                  </p>
                  <p>
                    <strong>Information Collected:</strong> Your official university student ID, name, email address, department, and relevant academic metadata are used solely for authentication, event check-ins, complaints processing, and verification.
                  </p>
                  <p>
                    <strong>Data Protection:</strong> We do not sell or distribute personal information to external commercial third parties. All access is governed strictly by City University IT security regulations.
                  </p>
                  <p>
                    For questions regarding your data privacy, contact the university administration at{' '}
                    <a href="mailto:info@cityuniversity.ac.bd" className="text-red-400 underline">
                      info@cityuniversity.ac.bd
                    </a>.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
