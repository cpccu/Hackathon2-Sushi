'use client';

import React from 'react';
import {
  ComplaintCategory,
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
} from '@/types/complaint';
import { Search, X, Filter, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

interface ComplaintFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: ComplaintCategory | 'all';
  onCategoryChange: (val: ComplaintCategory | 'all') => void;
  responseStatus: 'all' | 'true' | 'false';
  onResponseStatusChange: (val: 'all' | 'true' | 'false') => void;
  totalCount: number;
}

export default function ComplaintFilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  responseStatus,
  onResponseStatusChange,
  totalCount,
}: ComplaintFilterBarProps) {
  return (
    <div className="w-full space-y-4 rounded-2xl border border-zinc-800 bg-[#121214] p-4 shadow-sm sm:p-5">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          id="complaint-search-input"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search complaints by title or description..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-white"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
        {/* Category & Status Selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Filter className="h-3 w-3 text-zinc-500" />
              Category:
            </span>
            <select
              id="complaint-category-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as ComplaintCategory | 'all')}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {COMPLAINT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Response Status Segmented Toggle */}
          <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs font-medium">
            <button
              id="complaint-status-all"
              type="button"
              onClick={() => onResponseStatusChange('all')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                responseStatus === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              All
            </button>
            <button
              id="complaint-status-responded"
              type="button"
              onClick={() => onResponseStatusChange('true')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                responseStatus === 'true'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Responded
            </button>
            <button
              id="complaint-status-no-response"
              type="button"
              onClick={() => onResponseStatusChange('false')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                responseStatus === 'false'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-amber-400'
              }`}
            >
              <Clock className="h-3 w-3" />
              No Response
            </button>
          </div>
        </div>

        {/* Total Count */}
        <span className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{totalCount}</span> complaint{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
