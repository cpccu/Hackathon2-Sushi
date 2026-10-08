'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LostFoundPost, LostFoundType, LostFoundStatus } from '@/types/lostFound';
import { getLostFoundPosts } from '@/lib/api/lostFound';
import PostCard from '@/components/lost-found/PostCard';
import PostFilterBar from '@/components/lost-found/PostFilterBar';
import { PlusCircle, SearchX, Loader2, Sparkles, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function LostFoundBrowsePage() {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [postType, setPostType] = useState<LostFoundType | 'all'>('all');
  const [status, setStatus] = useState<LostFoundStatus | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when any filter changes
  const handlePostTypeChange = (newType: LostFoundType | 'all') => {
    setPostType(newType);
    setPage(1);
  };

  const handleStatusChange = (newStatus: LostFoundStatus | 'all') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleFromDateChange = (date: string) => {
    setFromDate(date);
    setPage(1);
  };

  const handleToDateChange = (date: string) => {
    setToDate(date);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setPostType('all');
    setStatus('all');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    postType !== 'all' ||
    status !== 'all' ||
    fromDate ||
    toDate
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLostFoundPosts({
        q: debouncedSearch.trim() || undefined,
        post_type: postType !== 'all' ? postType : undefined,
        status: status !== 'all' ? status : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit: 12,
      });

      setPosts(data.posts);
      setTotalCount(data.pagination.total);
      setHasMore(data.pagination.hasMore);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Lost & Found items');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, postType, status, fromDate, toDate, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-[#09090b] pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 via-zinc-900/30 to-[#09090b] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Lost & Found Hub
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base max-w-2xl">
                Misplaced an item or picked up someone's belongings? Search the live registry or file a report with photo verification.
              </p>
            </div>

            {/* Report CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/lost-found/create"
                id="report-item-btn"
                className="btn-accent inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-md shadow-red-500/20"
              >
                <PlusCircle className="h-4 w-4" />
                Report Item
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
        {/* Filter Bar */}
        <PostFilterBar
          search={search}
          onSearchChange={setSearch}
          postType={postType}
          onPostTypeChange={handlePostTypeChange}
          status={status}
          onStatusChange={handleStatusChange}
          fromDate={fromDate}
          onFromDateChange={handleFromDateChange}
          toDate={toDate}
          onToDateChange={handleToDateChange}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Results Metadata Header */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              Showing <span className="font-semibold text-zinc-200">{posts.length}</span> of{' '}
              <span className="font-semibold text-zinc-200">{totalCount}</span> items
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-zinc-500">Filtered results</span>
          )}
        </div>

        {/* Post Grid or Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] w-full rounded-lg bg-zinc-800" />
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-800/60" />
                <div className="h-3 w-1/2 rounded bg-zinc-800/60" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Previous Page
              </button>
              <span className="text-xs text-zinc-400 font-medium">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Next Page
              </button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-16 text-center">
            <div className="rounded-full bg-zinc-900 p-4 border border-zinc-800 text-zinc-500 mb-3">
              <SearchX className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">
              No matching items found
            </h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              We couldn't find any lost or found reports matching your criteria. Try adjusting keywords or date filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary mt-5 text-xs"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
