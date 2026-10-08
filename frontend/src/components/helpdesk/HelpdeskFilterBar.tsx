'use client';

import React from 'react';
import { HelpdeskPostType } from '@/types/helpdesk';
import { Search, X, GraduationCap, Building2, Layers } from 'lucide-react';

interface HelpdeskFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  postType: HelpdeskPostType | 'all';
  onPostTypeChange: (val: HelpdeskPostType | 'all') => void;
  totalCount: number;
}

export default function HelpdeskFilterBar({
  search,
  onSearchChange,
  postType,
  onPostTypeChange,
  totalCount,
}: HelpdeskFilterBarProps) {
  return (
    <div className="w-full space-y-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm sm:p-5">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          id="helpdesk-search-input"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by topic, question, rules, fees, waiver, library, bus, canteen..."
          className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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

      {/* Filter Tabs & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-800/60">
        <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs font-medium">
          <button
            onClick={() => onPostTypeChange('all')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150 ${
              postType === 'all'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            All Topics
          </button>
          <button
            onClick={() => onPostTypeChange('academic')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150 ${
              postType === 'academic'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-blue-400'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Academic
          </button>
          <button
            onClick={() => onPostTypeChange('facilities')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150 ${
              postType === 'facilities'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Facilities
          </button>
        </div>

        <span className="text-xs text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{totalCount}</span> article{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
