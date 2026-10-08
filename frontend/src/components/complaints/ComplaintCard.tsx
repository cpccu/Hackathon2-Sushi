'use client';

import React from 'react';
import Link from 'next/link';
import { Complaint, COMPLAINT_CATEGORY_LABELS } from '@/types/complaint';
import { MessageSquare, Paperclip, CheckCheck } from 'lucide-react';
import { formatDateDDMMYYYY } from '@/lib/formatters';

interface ComplaintCardProps {
  complaint: Complaint;
  isHelpdeskAdmin?: boolean;
}

const CATEGORY_STYLES: Record<string, string> = {
  academic: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  facilities: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  general: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  transport: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  hostel: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  other: 'bg-zinc-500/15 text-zinc-400 border-zinc-600/30',
};

export default function ComplaintCard({ complaint, isHelpdeskAdmin }: ComplaintCardProps) {
  const categoryStyle =
    CATEGORY_STYLES[complaint.category] ?? 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';

  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#121214] p-5 transition-all duration-150 hover:border-zinc-700 hover:bg-[#161619]"
    >
      {/* Top row: category + responded_by_me */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${categoryStyle}`}
        >
          {COMPLAINT_CATEGORY_LABELS[complaint.category] ?? complaint.category}
        </span>

        {isHelpdeskAdmin && complaint.responded_by_me && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <CheckCheck className="h-3 w-3" />
            Responded by You
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-red-400 transition-colors line-clamp-2">
        {complaint.title}
      </h3>

      {/* Description preview */}
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {complaint.description}
      </p>

      {/* Bottom row: date + stats */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
        <span className="text-[11px] text-zinc-500">
          {formatDateDDMMYYYY(complaint.created_at)}
        </span>

        <div className="flex items-center gap-3">
          {complaint.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500">
              <Paperclip className="h-3 w-3" />
              {complaint.attachments.length}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              complaint.response_count > 0 ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            {complaint.response_count}{' '}
            {complaint.response_count === 1 ? 'Response' : 'Responses'}
          </span>
        </div>
      </div>
    </Link>
  );
}
