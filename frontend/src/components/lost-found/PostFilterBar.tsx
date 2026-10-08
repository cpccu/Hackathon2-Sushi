'use client';

import React from 'react';
import { LostFoundType, LostFoundStatus } from '@/types/lostFound';
import { Search, X, Calendar, RotateCcw } from 'lucide-react';

interface PostFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  postType: LostFoundType | 'all';
  onPostTypeChange: (val: LostFoundType | 'all') => void;
  status: LostFoundStatus | 'all';
  onStatusChange: (val: LostFoundStatus | 'all') => void;
  fromDate: string;
  onFromDateChange: (val: string) => void;
  toDate: string;
  onToDateChange: (val: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function PostFilterBar({
  search,
  onSearchChange,
  postType,
  onPostTypeChange,
  status,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onReset,
  hasActiveFilters,
}: PostFilterBarProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 backdrop-blur-sm sm:p-5">
      {/* Top row: Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          id="lost-found-search-input"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by item name, description, keywords, location, or date..."
          className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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

      {/* Filter Row: Type & Status segmented controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Post Type Segmented Control */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Type:</span>
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs font-medium">
            <button
              onClick={() => onPostTypeChange('all')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                postType === 'all'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onPostTypeChange('lost')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                postType === 'lost'
                  ? 'bg-red-500 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-red-400'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => onPostTypeChange('found')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                postType === 'found'
                  ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">Status:</span>
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs font-medium">
            <button
              onClick={() => onStatusChange('all')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                status === 'all'
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onStatusChange('active')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                status === 'active'
                  ? 'bg-amber-500/90 text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-amber-400'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onStatusChange('resolved')}
              className={`rounded-md px-2.5 py-1 sm:px-3 sm:py-1.5 transition-all duration-150 ${
                status === 'resolved'
                  ? 'bg-zinc-700 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

      {/* Date Range & Reset Row: Fully responsive on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 border-t border-zinc-800/60">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          {/* From Date */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs overflow-hidden">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="text-zinc-400 shrink-0 text-[11px]">From:</span>
            <input
              type="date"
              max={today}
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-full min-w-0 bg-transparent text-zinc-200 text-xs focus:outline-none [color-scheme:dark]"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs overflow-hidden">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            <span className="text-zinc-400 shrink-0 text-[11px]">To:</span>
            <input
              type="date"
              max={today}
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-full min-w-0 bg-transparent text-zinc-200 text-xs focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all duration-150 active:scale-95 shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
