'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  RESOURCE_CATEGORIES,
  RESOURCE_SEMESTERS,
  DEPARTMENTS,
} from '@/lib/constants';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  Search,
  PlusCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Filter,
  X,
  BookOpen,
  Calendar,
  GraduationCap,
  Layers,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  course_name: string;
  course_code: string | null;
  description: string;
  year: number;
  semester: string;
  department: string;
  category: string;
  optional_note: string | null;
  created_at: string;
  uploader_id: string;
  uploader_name: string;
  uploader_batch: string | null;
  uploader_department: string | null;
  document_count: number;
  upvotes: number;
  downvotes: number;
  vote_score: number;
  user_vote: number | null;
}

interface ResourcesApiResponse {
  success: boolean;
  data: {
    resources: ResourceItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export default function ResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Generate year options (2018 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 2017 },
    (_, i) => currentYear - i
  );

  // Fetch resources
  const fetchResources = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params: Record<string, any> = {
          page: pageNum,
          limit: 20,
        };

        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedYear) params.year = selectedYear;
        if (selectedSemester) params.semester = selectedSemester;
        if (selectedDepartment) params.department = selectedDepartment;
        if (selectedCategory) params.category = selectedCategory;

        const res: ResourcesApiResponse = await apiFetch('/resources', { params });

        if (append) {
          setResources((prev) => [...prev, ...res.data.resources]);
        } else {
          setResources(res.data.resources);
        }

        setHasMore(res.data.pagination.hasMore);
        setTotalCount(res.data.pagination.total);
        setPage(pageNum);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load resources');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      debouncedSearch,
      selectedYear,
      selectedSemester,
      selectedDepartment,
      selectedCategory,
    ]
  );

  // Re-fetch on filter or search changes
  useEffect(() => {
    fetchResources(1, false);
  }, [fetchResources]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchResources(page + 1, true);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setSelectedYear('');
    setSelectedSemester('');
    setSelectedDepartment('');
    setSelectedCategory('');
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedYear) ||
    Boolean(selectedSemester) ||
    Boolean(selectedDepartment) ||
    Boolean(selectedCategory);

  const activeFiltersCount =
    (selectedYear ? 1 : 0) +
    (selectedSemester ? 1 : 0) +
    (selectedDepartment ? 1 : 0) +
    (selectedCategory ? 1 : 0);

  // Handle vote toggle
  const handleVote = async (
    e: React.MouseEvent,
    resourceId: string,
    voteType: 1 | -1
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to vote on resources');
      router.push('/login');
      return;
    }

    if (votingMap[resourceId]) return;

    // Optimistic UI update
    setVotingMap((prev) => ({ ...prev, [resourceId]: true }));

    const prevResources = [...resources];
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;
        const currentVote = r.user_vote;
        let newVote: number | null = voteType;
        let diff = 0;

        if (currentVote === voteType) {
          // untoggle
          newVote = null;
          diff = voteType === 1 ? -1 : 1;
        } else if (currentVote === null) {
          // new vote
          diff = voteType === 1 ? 1 : -1;
        } else {
          // switched vote
          diff = voteType === 1 ? 2 : -2;
        }

        return {
          ...r,
          user_vote: newVote,
          vote_score: r.vote_score + diff,
          upvotes:
            currentVote === 1
              ? r.upvotes - 1
              : voteType === 1
                ? r.upvotes + 1
                : r.upvotes,
          downvotes:
            currentVote === -1
              ? r.downvotes - 1
              : voteType === -1
                ? r.downvotes + 1
                : r.downvotes,
        };
      })
    );

    try {
      const res = await apiFetch(`/resources/${resourceId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote_type: voteType }),
      });

      // Synchronize with server response
      setResources((prev) =>
        prev.map((r) =>
          r.id === resourceId
            ? {
              ...r,
              vote_score: res.data.vote_score,
              upvotes: res.data.upvotes,
              downvotes: res.data.downvotes,
              user_vote: res.data.user_vote,
            }
            : r
        )
      );
    } catch (err: any) {
      // Revert optimistic update
      setResources(prevResources);
      toast.error(err.message || 'Voting failed');
    } finally {
      setVotingMap((prev) => ({ ...prev, [resourceId]: false }));
    }
  };

  // Category badge colors
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Mid Question':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/50';
      case 'Final Question':
        return 'bg-red-950/40 text-red-300 border-red-800/50';
      case 'Class Test':
        return 'bg-purple-950/40 text-purple-300 border-purple-800/50';
      case 'Class Notes':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50';
      case 'Slides':
        return 'bg-blue-950/40 text-blue-300 border-blue-800/50';
      case 'Assignment':
        return 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50';
      case 'Lab':
        return 'bg-teal-950/40 text-teal-300 border-teal-800/50';
      default:
        return 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero / Header Section */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-8">
        <div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Community Study Resources
          </h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
            Explore past exam papers, lecture handouts, lab solutions, and
            course notes shared by students across all departments.
          </p>
        </div>

        <Link
          href="/resources/upload"
          className="btn-accent inline-flex items-center gap-2 py-2.5 px-5 text-sm font-semibold shadow-lg shadow-red-950/50 shrink-0 active:scale-95 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Release Resource</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3.5 rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-5 shadow-sm">
        {/* Top Toolbar: Search input + Filters Toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, Course Name, or Code (e.g. CSE 211, Data Structures)..."
              className="input-field pl-10 pr-10 text-xs sm:text-sm py-2.5"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer shrink-0 ${showFilters || activeFiltersCount > 0
              ? 'border-red-500/60 bg-red-950/40 text-white shadow-sm shadow-red-950'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
          >
            <Filter className="h-4 w-4 text-red-500" />
            <span>More Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Category Filter Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 sm:flex-wrap no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${selectedCategory === ''
              ? 'bg-red-600 text-white shadow-sm shadow-red-950 font-semibold'
              : 'border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
          >
            All Categories
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                ? 'bg-red-600 text-white shadow-sm shadow-red-950 font-semibold'
                : 'border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Collapsible Secondary Filters Tray */}
        {showFilters && (
          <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 space-y-3 pt-3">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Filter by Academic Parameters
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Department */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="h-3.5 w-3.5 text-red-500" />
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input-field text-xs py-2 bg-zinc-900 cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-red-500" />
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="input-field text-xs py-2 bg-zinc-900 cursor-pointer"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1">
                  <Layers className="h-3.5 w-3.5 text-red-500" />
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="input-field text-xs py-2 bg-zinc-900 cursor-pointer"
                >
                  <option value="">All Semesters</option>
                  {RESOURCE_SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary & Dismissible Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-500 text-[11px] mr-0.5">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 pl-2.5 pr-1.5 py-0.5 text-xs text-zinc-200 border border-zinc-700/60">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:text-red-400 p-0.5 cursor-pointer"
                    title="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedDepartment && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 pl-2.5 pr-1.5 py-0.5 text-xs text-zinc-200 border border-zinc-700/60">
                  <span className="max-w-[140px] sm:max-w-none truncate">{selectedDepartment}</span>
                  <button
                    onClick={() => setSelectedDepartment('')}
                    className="hover:text-red-400 p-0.5 cursor-pointer"
                    title="Remove department filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 pl-2.5 pr-1.5 py-0.5 text-xs text-zinc-200 border border-zinc-700/60">
                  <span>Year {selectedYear}</span>
                  <button
                    onClick={() => setSelectedYear('')}
                    className="hover:text-red-400 p-0.5 cursor-pointer"
                    title="Remove year filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedSemester && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 pl-2.5 pr-1.5 py-0.5 text-xs text-zinc-200 border border-zinc-700/60">
                  <span>{selectedSemester}</span>
                  <button
                    onClick={() => setSelectedSemester('')}
                    className="hover:text-red-400 p-0.5 cursor-pointer"
                    title="Remove semester filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/90 pl-2.5 pr-1.5 py-0.5 text-xs text-zinc-200 border border-zinc-700/60">
                  <span>"{search}"</span>
                  <button
                    onClick={() => setSearch('')}
                    className="hover:text-red-400 p-0.5 cursor-pointer"
                    title="Clear search text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing{' '}
          <strong className="text-white">{resources.length}</strong> of{' '}
          <strong className="text-white">{totalCount}</strong> resources
        </span>
        <span className="text-zinc-500">
          Ranked by <span className="text-zinc-300">Vote Score</span> &amp; Newest
        </span>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-56 animate-pulse rounded-2xl border border-zinc-800 bg-[#121214] p-6"
            />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-[#121214]/60 p-12 text-center">
          <BookOpen className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No resources found</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            {hasActiveFilters
              ? 'Try modifying or resetting your filter criteria to find matching study materials.'
              : 'Be the first student to release past questions, slides, or class notes!'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="mt-4 btn-secondary text-xs py-1.5 px-3"
            >
              Clear All Filters
            </button>
          ) : (
            <Link
              href="/resources/upload"
              className="mt-4 btn-accent text-xs py-2 px-4"
            >
              Release Resource Now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {resources.map((item) => (
            <Link
              key={item.id}
              href={`/resources/${item.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-[#121214] p-5 sm:p-6 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:bg-[#161619] hover:shadow-md"
            >
              {/* Card Top: Badges and Vote Score */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Category Badge */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>

                    {/* Course Code */}
                    {item.course_code && (
                      <span className="rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                        {item.course_code}
                      </span>
                    )}

                    {/* Document count */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-800">
                      <FileText className="h-3 w-3 text-red-500" />
                      {item.document_count}{' '}
                      {item.document_count === 1 ? 'doc' : 'docs'}
                    </span>
                  </div>

                  {/* Inline Voting Widget */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1 shrink-0"
                  >
                    <button
                      onClick={(e) => handleVote(e, item.id, 1)}
                      title="Upvote"
                      className={`p-1 rounded cursor-pointer transition-colors ${item.user_vote === 1
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : 'text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800/50'
                        }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>

                    <span
                      className={`text-xs font-bold px-1 min-w-[20px] text-center ${item.vote_score > 0
                        ? 'text-emerald-400'
                        : item.vote_score < 0
                          ? 'text-red-400'
                          : 'text-zinc-400'
                        }`}
                    >
                      {item.vote_score}
                    </span>

                    <button
                      onClick={(e) => handleVote(e, item.id, -1)}
                      title="Downvote"
                      className={`p-1 rounded cursor-pointer transition-colors ${item.user_vote === -1
                        ? 'text-red-400 bg-red-950/60'
                        : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50'
                        }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Resource Title */}
                <h2 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                  {item.title}
                </h2>

                {/* Course Name */}
                <p className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>{item.course_name}</span>
                </p>

                {/* Description Snippet */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Bottom Meta */}
              <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-zinc-500">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate text-zinc-400">
                    {item.department}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-300 font-medium">
                    {item.semester} {item.year}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
                  <span>By {item.uploader_name}</span>
                  {item.uploader_batch && (
                    <span className="text-zinc-500">({item.uploader_batch})</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary inline-flex items-center gap-2 text-xs font-semibold py-2.5 px-6 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading more resources...</span>
              </>
            ) : (
              <span>Load More Resources</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
