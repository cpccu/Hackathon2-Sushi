'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { EventListItem } from '@/types/index';
import { Calendar, MapPin, Search, Filter, Loader2, Sparkles, Building2 } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Competitive Programming',
  'Hackathon',
  'Cultural',
  'Sports',
  'Seminar',
  'Workshop',
  'Other',
];

const DEPARTMENTS = [
  'All',
  'Computer Science and Engineering',
  'Electrical & Electronic Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Textile Engineering',
  'Pharmacy',
  'Business Administration',
  'English',
  'Law',
  'Agriculture',
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchEvents = useCallback(
    async (currentPage = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params: Record<string, any> = {
          page: currentPage,
          limit: 20,
        };

        if (search.trim()) params.search = search.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedDept !== 'All') params.department = selectedDept;
        if (selectedDate) params.date = selectedDate;

        const res = await apiFetch<{
          success: boolean;
          data: EventListItem[];
          pagination: { page: number; limit: number; total: number; hasMore: boolean };
        }>('/events', { params });

        if (append) {
          setEvents((prev) => [...prev, ...res.data]);
        } else {
          setEvents(res.data);
        }

        setHasMore(res.pagination.hasMore);
        setPage(currentPage);
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, selectedCategory, selectedDept, selectedDate]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(1, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchEvents(page + 1, true);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedDept('All');
    setSelectedDate('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Title & Description */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campus Events</h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Browse upcoming City University club competitions, hackathons, and activities.
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-[#121214] p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search by name */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event name..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter (Native date input) */}
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 [color-scheme:dark]"
            />
            {(search || selectedCategory !== 'All' || selectedDept !== 'All' || selectedDate) && (
              <button
                onClick={clearFilters}
                className="btn-ghost shrink-0 px-2.5 py-1.5 text-xs text-zinc-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <Calendar className="h-10 w-10 text-zinc-600" />
          <h3 className="mt-4 text-base font-medium text-white">No events found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Try adjusting your search criteria or clearing your filters.
          </p>
          <button onClick={clearFilters} className="btn-secondary mt-4 text-xs font-medium">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-[#121214] transition-all duration-150 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-lg active:scale-95"
              >
                {/* Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                  {event.cover_image_url ? (
                    <img
                      src={event.cover_image_url}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  )}

                  {/* Status & Category Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-200 backdrop-blur-sm">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${event.status === 'ongoing'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                        : event.status === 'upcoming'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                          : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800'
                        }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Club info: Club Logo + Club Name */}
                  <div className="flex items-center gap-2">
                    {event.club_logo_url ? (
                      <img
                        src={event.club_logo_url}
                        alt={event.club_name}
                        className="h-5 w-5 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-zinc-400" />
                    )}
                    <span className="text-xs font-medium text-zinc-400">{event.club_name}</span>
                  </div>

                  {/* Event Name */}
                  <h3 className="mt-2 text-base font-semibold tracking-tight text-white group-hover:text-red-400 transition-colors duration-150">
                    {event.name}
                  </h3>

                  {/* Department Restrictions */}
                  <div className="mt-2 text-[11px] text-zinc-500 line-clamp-1">
                    {event.allowed_departments && event.allowed_departments.length > 0 ? (
                      <span>Dept: {event.allowed_departments.join(', ')}</span>
                    ) : (
                      <span>Open to all university departments</span>
                    )}
                  </div>

                  {/* Date & Time Footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-red-500" />
                      <span>{event.event_date}</span>
                    </div>
                    <span>{new Date(`1970-01-01T${event.start_time}`).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary inline-flex items-center gap-2 px-8 py-2.5 text-xs font-semibold"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    Loading events...
                  </>
                ) : (
                  'Load More Events'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
