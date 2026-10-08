'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Complaint, ComplaintCategory } from '@/types/complaint';
import { getComplaints } from '@/lib/api/complaint';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import ComplaintFilterBar from '@/components/complaints/ComplaintFilterBar';
import ComplaintSubmitForm from '@/components/complaints/ComplaintSubmitForm';
import {
  Plus,
  SearchX,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | 'all'>('all');
  const [responseStatus, setResponseStatus] = useState<'all' | 'true' | 'false'>('all');

  // Submit modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleCategoryChange = (val: ComplaintCategory | 'all') => {
    setCategory(val);
    setPage(1);
  };

  const handleResponseStatusChange = (val: 'all' | 'true' | 'false') => {
    setResponseStatus(val);
    setPage(1);
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getComplaints({
        search: debouncedSearch.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        has_response: responseStatus !== 'all' ? responseStatus : undefined,
        page,
        limit,
      });

      setComplaints(data.complaints);
      setTotalCount(data.pagination.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, responseStatus, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Title & Description Header (Matches Events Page Structure) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Campus Complaints
          </h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Voice university-related concerns anonymously and receive verified responses from administration.
          </p>
        </div>

        {/* Action Button: Submit Complaint for Students / Log in prompt */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            user.role === 'student' && (
              <button
                id="open-submit-complaint-btn"
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-red-500 transition-all shadow-md shadow-red-950/40 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Submit Complaint
              </button>
            )
          ) : (
            <Link
              href="/login?redirect=/complaints"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-white transition-all shadow-sm"
            >
              <LogIn className="h-4 w-4 text-red-500" />
              Log in to Submit
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <ComplaintFilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={handleCategoryChange}
        responseStatus={responseStatus}
        onResponseStatusChange={handleResponseStatusChange}
        totalCount={totalCount}
      />

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-[#121214] p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 w-1/4 rounded bg-zinc-800" />
              <div className="h-5 w-3/4 rounded bg-zinc-800" />
              <div className="h-3 w-full rounded bg-zinc-800/60" />
              <div className="h-3 w-5/6 rounded bg-zinc-800/60" />
              <div className="h-4 w-1/2 rounded bg-zinc-800/60 pt-2 border-t border-zinc-800/60" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#121214] p-8 text-center">
          <SearchX className="h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No complaints found</h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm">
            {search || category !== 'all' || responseStatus !== 'all'
              ? "We couldn't find any complaints matching your filter criteria. Try adjusting or clearing your filters."
              : 'There are currently no complaints recorded. You can submit one anonymously above.'}
          </p>
          {(search || category !== 'all' || responseStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('all');
                setResponseStatus('all');
              }}
              className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {complaints.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              isHelpdeskAdmin={user?.role === 'helpdesk_admin'}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="px-3 text-xs text-zinc-400">
            Page <strong className="text-zinc-200">{page}</strong> of{' '}
            <strong className="text-zinc-200">{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Submit Complaint Modal */}
      <ComplaintSubmitForm
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          setPage(1);
          fetchComplaints();
        }}
      />
    </div>
  );
}
