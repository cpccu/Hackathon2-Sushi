'use client';

import React from 'react';
import Link from 'next/link';
import { HelpdeskPost } from '@/types/helpdesk';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  GraduationCap,
  Building2,
  Paperclip,
  ListOrdered,
  Tag,
  UserCheck,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface HelpdeskCardProps {
  post: HelpdeskPost;
}

export default function HelpdeskCard({ post }: HelpdeskCardProps) {
  const isAcademic = post.post_type === 'academic';

  return (
    <Link
      href={`/helpdesk/${post.id}`}
      id={`helpdesk-card-${post.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-black/30 active:scale-[0.99]"
    >
      <div>
        {/* Top Type Badge & Meta Counter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase shadow-sm ${
              isAcademic
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isAcademic ? (
              <>
                <GraduationCap className="h-3.5 w-3.5" />
                Academic
              </>
            ) : (
              <>
                <Building2 className="h-3.5 w-3.5" />
                Facilities
              </>
            )}
          </span>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            {post.steps && post.steps.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 border border-zinc-700/60">
                <ListOrdered className="h-3 w-3 text-red-400" />
                {post.steps.length} Steps
              </span>
            )}
            {post.attachments && post.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 border border-zinc-700/60">
                <Paperclip className="h-3 w-3 text-zinc-400" />
                {post.attachments.length} Attachment{post.attachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 transition-colors group-hover:text-red-400 line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {/* Description snippet */}
        <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
          {post.description.replace(/[#*`_]/g, '')}
        </p>

        {/* Keywords Tags */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.keywords.slice(0, 3).map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-zinc-800/70 px-2 py-0.5 text-[10px] text-zinc-300 border border-zinc-700/50"
              >
                <Tag className="h-2.5 w-2.5 text-zinc-500" />
                {kw}
              </span>
            ))}
            {post.keywords.length > 3 && (
              <span className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-500">
                +{post.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details: Provided By & Last Updated */}
      <div className="mt-5 border-t border-zinc-800/80 pt-3.5 flex items-center justify-between text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
          <UserCheck className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="truncate">
            By <span className="text-zinc-300 font-medium">{post.provided_by}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          <Calendar className="h-3 w-3 text-zinc-500" />
          <span>{formatDateDDMMYYYY(post.updated_at)}</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300 ml-1" />
        </div>
      </div>
    </Link>
  );
}
