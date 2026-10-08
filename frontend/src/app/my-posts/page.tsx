'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMyLostFoundPosts } from '@/lib/api/lostFound';
import { LostFoundPost, LostFoundStatus } from '@/types/lostFound';
import ResolveStatusModal from '@/components/lost-found/ResolveStatusModal';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  PackageSearch,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyPostsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LostFoundStatus | 'all'>('all');

  // Modal state
  const [resolvingPost, setResolvingPost] = useState<LostFoundPost | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to manage your posts');
      router.push('/login?redirect=/my-posts');
      return;
    }

    async function loadPosts() {
      setLoading(true);
      try {
        const data = await getMyLostFoundPosts();
        setPosts(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load your posts');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadPosts();
    }
  }, [user, authLoading, router]);

  // Derived counts
  const totalPosts = posts.length;
  const activePosts = posts.filter((p) => p.status === 'active').length;
  const resolvedPosts = posts.filter((p) => p.status === 'resolved').length;

  const filteredPosts = posts.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const handlePostUpdated = (updated: LostFoundPost) => {
    setPosts(posts.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostResolved = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, status: 'resolved' as const } : p
      )
    );
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My Lost & Found Posts
              </h1>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Manage your submitted reports, update details, or mark recovered items as resolved.
              </p>
            </div>

            <Link
              href="/lost-found/create"
              className="btn-accent inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold shadow-md shadow-red-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              New Report
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 sm:p-4">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Total Posts
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-zinc-100">
                {totalPosts}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
              <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
                Active Reports
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-300">
                {activePosts}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
              <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
                Resolved Items
              </span>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-300">
                {resolvedPosts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 space-y-6">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
          <span className="text-xs font-medium text-zinc-400 mr-2">Status:</span>
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-md px-3 py-1.5 transition-all duration-150 ${statusFilter === 'all'
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              All ({totalPosts})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`rounded-md px-3 py-1.5 transition-all duration-150 ${statusFilter === 'active'
                ? 'bg-amber-500/90 text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-amber-400'
                }`}
            >
              Active ({activePosts})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`rounded-md px-3 py-1.5 transition-all duration-150 ${statusFilter === 'resolved'
                ? 'bg-zinc-700 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              Resolved ({resolvedPosts})
            </button>
          </div>
        </div>

        {/* Post List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const isLost = post.post_type === 'lost';
              const isResolved = post.status === 'resolved';

              return (
                <div
                  key={post.id}
                  id={`my-post-${post.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 overflow-hidden w-full sm:w-auto">
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                      {post.images?.[0] ? (
                        <img
                          src={post.images[0]}
                          alt={post.item_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                          No Photo
                        </div>
                      )}
                      <span
                        className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${isLost
                          ? 'bg-red-500 text-white'
                          : 'bg-emerald-500 text-white'
                          }`}
                      >
                        {isLost ? 'LOST' : 'FOUND'}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/lost-found/${post.id}`}
                          className="font-semibold text-sm sm:text-base text-zinc-100 hover:text-red-400 transition-colors line-clamp-1"
                        >
                          {post.item_name}
                        </Link>
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold shrink-0 ${isResolved
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                        >
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              Resolved
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-amber-400" />
                              Active
                            </>
                          )}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                        {post.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-red-500" />
                          <span className="truncate max-w-[150px]">
                            {post.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDateDDMMYYYY(post.incident_date)}</span>
                        </div>
                        {post.images?.length > 1 && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                            {post.images.length} photos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t border-zinc-800/80 pt-3 sm:border-0 sm:pt-0 shrink-0">
                    {/* View Details Link */}
                    <Link
                      href={`/lost-found/${post.id}`}
                      className="btn-ghost text-xs p-2"
                      title="View Post"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {/* Edit Button */}
                    {!isResolved && (
                      <Link
                        href={`/lost-found/${post.id}/edit`}
                        className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    )}

                    {/* Resolve Button */}
                    {!isResolved && (
                      <button
                        onClick={() => setResolvingPost(post)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-16 text-center">
            <div className="rounded-full bg-zinc-900 p-4 border border-zinc-800 text-zinc-500 mb-3">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">
              No reports found
            </h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              {statusFilter === 'all'
                ? "You haven't submitted any lost or found reports yet."
                : `You don't have any ${statusFilter} reports.`}
            </p>
            <Link href="/lost-found/create" className="btn-accent mt-5 text-xs">
              Create a Report
            </Link>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingPost && (
        <ResolveStatusModal
          postId={resolvingPost.id}
          itemName={resolvingPost.item_name}
          isOpen={Boolean(resolvingPost)}
          onClose={() => setResolvingPost(null)}
          onResolved={() => handlePostResolved(resolvingPost.id)}
        />
      )}
    </div>
  );
}
