import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-[#09090b] text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-white active:scale-90">
              <span className="text-red-500">c</span>amp<span className="text-red-500">u</span>sOS
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Minimalist campus event & club administration infrastructure. Fast check-ins, zero clutter.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/events" className="transition-colors duration-150 hover:text-white">
                  Events Directory
                </Link>
              </li>
              <li>
                <Link href="/event-dashboard" className="transition-colors duration-150 hover:text-white">
                  Club Admin Hub
                </Link>
              </li>
              <li>
                <Link href="/my-events" className="transition-colors duration-150 hover:text-white">
                  Ticket Passes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Support & Contact</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a href="mailto:support@campusos.edu" className="transition-colors duration-150 hover:text-white">
                  support@campusos.edu
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Student Affairs Division</span>
              </li>
              <li>
                <span className="text-zinc-500">Campus Security & Check-In Desk</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Network</h4>
            <div className="mt-3 flex gap-3 text-xs">
              <a
                href="#"
                className="rounded border border-zinc-800 px-2.5 py-1 text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-90"
              >
                GitHub
              </a>
              <a
                href="#"
                className="rounded border border-zinc-800 px-2.5 py-1 text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-90"
              >
                Discord
              </a>
              <a
                href="#"
                className="rounded border border-zinc-800 px-2.5 py-1 text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-white active:scale-90"
              >
                Twitter / X
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-zinc-900 pt-6 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} campusOS. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
            <span className="cursor-pointer transition-colors duration-150 hover:text-zinc-400">Privacy Policy</span>
            <span className="cursor-pointer transition-colors duration-150 hover:text-zinc-400">Terms of Service</span>
            <span className="cursor-pointer transition-colors duration-150 hover:text-zinc-400">Club Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
