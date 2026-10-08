'use client';

import React from 'react';
import { ComplaintResponse } from '@/types/complaint';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import { ShieldCheck, MessageSquare, Clock } from 'lucide-react';

interface ResponseListProps {
  responses: ComplaintResponse[];
}

export default function ResponseList({ responses }: ResponseListProps) {
  if (!responses || responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#121214] p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 mb-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-200">No official responses yet</h4>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm">
          A helpdesk administrator will review this complaint and post an official response here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((resp, index) => (
        <div
          key={resp.id || index}
          className="rounded-2xl border border-zinc-800 bg-[#121214] p-5 sm:p-6 transition-all hover:border-zinc-700/80 shadow-sm"
        >
          {/* Header of Response */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {resp.responded_by || 'Helpdesk Admin'}
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                    Official Admin
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock className="h-3 w-3" />
              {formatDateDDMMYYYY(resp.created_at)}
            </div>
          </div>

          {/* Response Message Body */}
          <div className="pt-3.5 text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {resp.message}
          </div>
        </div>
      ))}
    </div>
  );
}
