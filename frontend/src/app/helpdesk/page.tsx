'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HelpdeskPost, HelpdeskPostType } from '@/types/helpdesk';
import { getHelpdeskPosts } from '@/lib/api/helpdesk';
import { useAuth } from '@/context/AuthContext';
import HelpdeskCard from '@/components/helpdesk/HelpdeskCard';
import HelpdeskFilterBar from '@/components/helpdesk/HelpdeskFilterBar';
import {
  Loader2,
  SearchX,
  Plus,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HelpdeskBrowsePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<HelpdeskPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [postType, setPostType] = useState<HelpdeskPostType | 'all'>('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handlePostTypeChange = (newType: HelpdeskPostType | 'all') => {
    setPostType(newType);
    setPage(1);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHelpdeskPosts({
        q: debouncedSearch.trim() || undefined,
        post_type: postType !== 'all' ? postType : undefined,
        page,
        limit,
      });

      setPosts(data.posts);
      setTotalCount(data.pagination.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Helpdesk topics');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, postType, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const quickTopics = [
    'Waiver Policy',
    'Examination Rules',
    'Admission Process',
    'Admission Fees',
    'Canteen',
    'Bus Routes',
    'Library',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Title & Description */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Smart Helpdesk</h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Instant answers to City University academic rules, waivers, fee structures, and campus facilities.
          </p>
        </div>

        {/* Admin CTA Buttons if Helpdesk Admin */}
        {user?.role === 'helpdesk_admin' && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/helpdesk-dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-all shadow-sm shrink-0"
            >
              <LayoutDashboard className="h-4 w-4 text-red-500" />
              Helpdesk Dashboard
            </Link>
            <Link
              href="/helpdesk-dashboard/create"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-red-500 transition-all shadow-md shadow-red-950/40 active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Topic
            </Link>
          </div>
        )}
      </div>

      {/* Quick topic pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">Popular:</span>
        {quickTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSearch(topic)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <HelpdeskFilterBar
        search={search}
        onSearchChange={setSearch}
        postType={postType}
        onPostTypeChange={handlePostTypeChange}
        totalCount={totalCount}
      />

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3 animate-pulse"
            >
              <div className="h-5 w-1/3 rounded bg-zinc-800" />
              <div className="h-5 w-3/4 rounded bg-zinc-800" />
              <div className="h-3 w-full rounded bg-zinc-800/60" />
              <div className="h-3 w-5/6 rounded bg-zinc-800/60" />
              <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <SearchX className="h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No Helpdesk topics found</h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm">
            We couldn&apos;t find any articles matching your search criteria. Try different keywords or clear the filter.
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <HelpdeskCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-6">
              <span className="text-xs text-zinc-400">
                Page <span className="font-semibold text-zinc-200">{page}</span> of{' '}
                <span className="font-semibold text-zinc-200">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    // </div>
  );
}
