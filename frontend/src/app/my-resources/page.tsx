'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  FolderOpen,
  PlusCircle,
  ExternalLink,
  Trash2,
  BookOpen,
  FileText,
  ThumbsUp,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface MyResourceItem {
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
  document_count: number;
  upvotes: number;
  downvotes: number;
  vote_score: number;
}

export default function MyResourcesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [resources, setResources] = useState<MyResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to view your resources');
      router.push('/login');
      return;
    }

    async function loadMyResources() {
      try {
        setLoading(true);
        const res = await apiFetch('/resources/my');
        setResources(res.data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load your resources');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadMyResources();
    }
  }, [user, authLoading, router]);

  const confirmDelete = (id: string, title: string) => {
    setDeletingId(id);
    setDeletingTitle(title);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      await apiFetch(`/resources/${deletingId}`, {
        method: 'DELETE',
      });
      toast.success('Resource deleted successfully');
      setResources((prev) => prev.filter((r) => r.id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Released Resources
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Manage your contributed study materials, review community vote scores, or remove old files.
          </p>
        </div>

        <Link
          href="/resources/upload"
          className="btn-accent inline-flex items-center gap-2 py-2 px-4 text-xs font-semibold shadow-lg shadow-red-950/50 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Release New Resource</span>
        </Link>
      </div>

      {/* Grid of User's Resources */}
      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-[#121214]/60 p-12 text-center">
          <BookOpen className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No resources released yet</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            You haven't contributed any study materials yet. Help your peers by sharing past questions or notes!
          </p>
          <Link
            href="/resources/upload"
            className="mt-4 btn-accent text-xs py-2 px-4"
          >
            Release Your First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121214] p-5 shadow-sm transition-all hover:border-zinc-700"
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-red-950/40 text-red-300 border border-red-800/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-500 text-[11px]">Score:</span>
                    <span
                      className={`font-bold text-xs ${item.vote_score > 0
                          ? 'text-emerald-400'
                          : item.vote_score < 0
                            ? 'text-red-400'
                            : 'text-zinc-400'
                        }`}
                    >
                      {item.vote_score}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white line-clamp-2">
                  {item.title}
                </h3>

                {/* Course */}
                <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>{item.course_name}</span>
                  {item.course_code && (
                    <span className="text-zinc-500 font-mono text-[11px]">
                      ({item.course_code})
                    </span>
                  )}
                </p>

                {/* Meta details */}
                <div className="text-[11px] text-zinc-500 space-y-1 pt-1">
                  <div>
                    {item.department} • {item.semester} {item.year}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <FileText className="h-3 w-3 text-red-400" />
                      {item.document_count} {item.document_count === 1 ? 'document' : 'documents'}
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      {formatDateDDMMYYYY(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/resources/${item.id}`}
                  className="btn-secondary inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Public Page</span>
                </Link>

                <button
                  onClick={() => confirmDelete(item.id, item.title)}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-950/30 transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeletingId(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="rounded-full bg-red-950/60 p-2.5 border border-red-900/50">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Delete Resource
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-white">"{deletingTitle}"</strong>?
              This will remove the resource and its attached files.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="btn-accent inline-flex items-center gap-1.5 text-xs py-2 px-4 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
