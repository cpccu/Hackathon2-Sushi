'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { HelpdeskPost, HelpdeskPostType } from '@/types/helpdesk';
import { getHelpdeskPosts, deleteHelpdeskPost } from '@/lib/api/helpdesk';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  HelpCircle,
  Plus,
  Search,
  X,
  GraduationCap,
  Building2,
  ListOrdered,
  Paperclip,
  ExternalLink,
  Edit3,
  Trash2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HelpdeskDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<HelpdeskPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<HelpdeskPostType | 'all'>('all');

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState<HelpdeskPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Authentication & RBAC guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/helpdesk-dashboard');
        return;
      }
      if (user.role !== 'helpdesk_admin') {
        toast.error('Access restricted to Helpdesk Administrators');
        router.push('/helpdesk');
        return;
      }
    }
  }, [user, authLoading, router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHelpdeskPosts({
        q: search.trim() || undefined,
        post_type: filterType !== 'all' ? filterType : undefined,
        limit: 100, // retrieve all for management table
      });
      setPosts(data.posts);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch helpdesk topics');
    } finally {
      setLoading(false);
    }
  }, [search, filterType]);

  useEffect(() => {
    if (user?.role === 'helpdesk_admin') {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await deleteHelpdeskPost(deletingPost.id);
      toast.success(`Deleted topic: "${deletingPost.title}"`);
      setDeletingPost(null);
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || (!user && !authLoading) || (user && user.role !== 'helpdesk_admin')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const academicCount = posts.filter((p) => p.post_type === 'academic').length;
  const facilitiesCount = posts.filter((p) => p.post_type === 'facilities').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header section matching events & event-dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-red-500">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-red-500 uppercase">
              Helpdesk Administration Portal
            </span>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Helpdesk Dashboard</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage City University knowledge base, academic guidelines, waiver terms, and facilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/helpdesk"
            className="btn-secondary inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live Helpdesk
          </Link>
          <Link
            href="/helpdesk-dashboard/create"
            className="btn-accent inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            New Topic
          </Link>
        </div>
      </div>

      {/* Stat metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-[#121214] p-5 shadow-sm transition-colors hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Knowledge Topics</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">{posts.length}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Official City University guides</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#121214] p-5 shadow-sm transition-colors hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Academic Guidelines</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">{academicCount}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Exams, fees, rules &amp; waivers</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#121214] p-5 shadow-sm transition-colors hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Facilities &amp; Campus</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">{facilitiesCount}</p>
          <p className="mt-1 text-[11px] text-zinc-500">Transport, medical &amp; hostel</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121214] p-3 sm:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics by title, keyword, or description..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-8 text-xs text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded px-3 py-1 font-medium transition-all ${
                filterType === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilterType('academic')}
              className={`rounded px-3 py-1 font-medium transition-all ${
                filterType === 'academic' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-blue-400'
              }`}
            >
              Academic ({academicCount})
            </button>
            <button
              onClick={() => setFilterType('facilities')}
              className={`rounded px-3 py-1 font-medium transition-all ${
                filterType === 'facilities' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              Facilities ({facilitiesCount})
            </button>
          </div>
        </div>

        {/* Posts Cards List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-zinc-800 bg-[#121214] animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#121214]/60 p-12 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <h3 className="text-base font-semibold text-zinc-200">No topics found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {search ? 'Try clearing your search query.' : 'Get started by creating your first Helpdesk topic.'}
            </p>
            {!search && (
              <Link
                href="/helpdesk-dashboard/create"
                className="btn-accent mt-4 inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4"
              >
                <Plus className="h-4 w-4" />
                Add Topic
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const isAcademic = post.post_type === 'academic';
              return (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121214] p-5 transition-all duration-150 hover:border-zinc-700 hover:bg-[#161619]"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isAcademic
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isAcademic ? (
                          <GraduationCap className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {isAcademic ? 'Academic' : 'Facilities'}
                      </span>

                      <span className="text-xs text-zinc-400">
                        Updated {formatDateDDMMYYYY(post.updated_at)}
                      </span>

                      <span className="text-zinc-600">•</span>
                      <span className="text-xs text-zinc-400">
                        Provided by <span className="text-zinc-300 font-medium">{post.provided_by}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white">
                      <Link
                        href={`/helpdesk/${post.id}`}
                        className="hover:text-red-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                      {post.description.replace(/[#*`_]/g, '')}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400">
                      {post.steps && post.steps.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-zinc-400">
                          <ListOrdered className="h-3.5 w-3.5 text-red-400" />
                          <span>{post.steps.length} Steps</span>
                        </span>
                      )}
                      {post.attachments && post.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-zinc-400">
                          <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{post.attachments.length} Attachment{post.attachments.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                      {post.keywords && post.keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {post.keywords.slice(0, 3).map((kw, i) => (
                            <span
                              key={i}
                              className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/40"
                            >
                              #{kw}
                            </span>
                          ))}
                          {post.keywords.length > 3 && (
                            <span className="text-[10px] text-zinc-500">
                              +{post.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons — mirrors event-dashboard pattern */}
                  <div className="flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 w-full sm:w-auto justify-end">
                    <Link
                      href={`/helpdesk/${post.id}`}
                      className="btn-ghost text-xs font-medium py-2 px-3"
                    >
                      Public Page
                    </Link>

                    <Link
                      href={`/helpdesk-dashboard/${post.id}/edit`}
                      className="btn-primary inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4"
                    >
                      Manage
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      onClick={() => setDeletingPost(post)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Helpdesk Topic</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 my-4 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-white">&quot;{deletingPost.title}&quot;</strong>? It will immediately disappear from the public Helpdesk knowledge base.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPost(null)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
