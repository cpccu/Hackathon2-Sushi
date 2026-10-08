'use client';

import React from 'react';
import Link from 'next/link';
import { LostFoundPost } from '@/types/lostFound';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import { MapPin, Calendar, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

interface PostCardProps {
  post: LostFoundPost;
}

export default function PostCard({ post }: PostCardProps) {
  const isLost = post.post_type === 'lost';
  const isResolved = post.status === 'resolved';
  const primaryImage = post.images?.[0] || null;

  return (
    <Link
      href={`/lost-found/${post.id}`}
      id={`post-card-${post.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/40 active:scale-[0.99]"
    >
      {/* Thumbnail / Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={post.item_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">
            <span className="text-sm font-medium">No Image Provided</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {/* Post Type Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md ${
              isLost
                ? 'bg-red-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {isLost ? 'LOST' : 'FOUND'}
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium backdrop-blur-md shadow-sm ${
              isResolved
                ? 'bg-zinc-800/90 text-zinc-300 border border-zinc-700'
                : 'bg-amber-500/80 text-black font-semibold'
            }`}
          >
            {isResolved ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                Resolved
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-black" />
                Active
              </>
            )}
          </span>
        </div>

        {/* Image count pill if multiple */}
        {post.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
            +{post.images.length - 1} photos
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="line-clamp-1 text-base font-semibold text-zinc-100 transition-colors group-hover:text-red-400">
          {post.item_name}
        </h3>

        {/* Description snippet */}
        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-400 leading-relaxed">
          {post.description}
        </p>

        {/* Meta details */}
        <div className="mt-3.5 space-y-1.5 border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span className="truncate">{post.location}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span>
              {isLost ? 'Lost on' : 'Found on'} {formatDateDDMMYYYY(post.incident_date)}
            </span>
          </div>
        </div>

        {/* Keywords tags (if any) */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.keywords.slice(0, 3).map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                <Tag className="h-2.5 w-2.5 text-zinc-500" />
                {kw}
              </span>
            ))}
            {post.keywords.length > 3 && (
              <span className="rounded bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-500">
                +{post.keywords.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Poster identity footer */}
        <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="truncate">
            By <span className="text-zinc-300 font-medium">{post.poster_name}</span>
          </span>
          {post.poster_department && (
            <span className="truncate max-w-[110px] text-zinc-500">
              {post.poster_batch ? `Batch ${post.poster_batch}` : post.poster_department}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
