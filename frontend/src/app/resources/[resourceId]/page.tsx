'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  formatDateDDMMYYYY,
  formatDateTimeDDMMYYYY,
  formatFileSize,
} from '@/lib/formatters';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  ThumbsUp,
  ThumbsDown,
  User as UserIcon,
  Trash2,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  Loader2,
  File,
  AlertTriangle,
} from 'lucide-react';

interface ResourceDocument {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

interface ResourceDetail {
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
  documents: ResourceDocument[];
}

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const resourceId = resolvedParams.resourceId;

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch resource detail
  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadResource() {
      try {
        setLoading(true);
        const res = await apiFetch(`/resources/${resourceId}`);
        setResource(res.data);
      } catch (err: any) {
        toast.error(err.message || 'Resource not found');
        router.push('/resources');
      } finally {
        setLoading(false);
      }
    }

    if (resourceId) {
      loadResource();
    }
  }, [resourceId, router]);

  // Vote toggle
  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      toast.error('Please log in to vote on this resource');
      router.push('/login');
      return;
    }

    if (!resource || voting) return;

    setVoting(true);
    const prev = { ...resource };

    // Optimistic update
    const currentVote = resource.user_vote;
    let newVote: number | null = voteType;
    let diff = 0;

    if (currentVote === voteType) {
      newVote = null;
      diff = voteType === 1 ? -1 : 1;
    } else if (currentVote === null) {
      diff = voteType === 1 ? 1 : -1;
    } else {
      diff = voteType === 1 ? 2 : -2;
    }

    setResource({
      ...resource,
      user_vote: newVote,
      vote_score: resource.vote_score + diff,
      upvotes:
        currentVote === 1
          ? resource.upvotes - 1
          : voteType === 1
            ? resource.upvotes + 1
            : resource.upvotes,
      downvotes:
        currentVote === -1
          ? resource.downvotes - 1
          : voteType === -1
            ? resource.downvotes + 1
            : resource.downvotes,
    });

    try {
      const res = await apiFetch(`/resources/${resourceId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote_type: voteType }),
      });

      setResource((curr) =>
        curr
          ? {
            ...curr,
            vote_score: res.data.vote_score,
            upvotes: res.data.upvotes,
            downvotes: res.data.downvotes,
            user_vote: res.data.user_vote,
          }
          : null
      );
    } catch (err: any) {
      setResource(prev);
      toast.error(err.message || 'Voting failed');
    } finally {
      setVoting(false);
    }
  };

  // Delete resource
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await apiFetch(`/resources/${resourceId}`, {
        method: 'DELETE',
      });
      toast.success('Resource deleted successfully');
      router.push('/my-resources');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource');
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-white">Resource not found</h2>
        <Link href="/resources" className="mt-4 btn-primary text-xs inline-block">
          Back to Resources
        </Link>
      </div>
    );
  }

  const isUploader = user && user.id === resource.uploader_id;

  // Category badge colors
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top back & actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Resources</span>
        </Link>

        {isUploader && (
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Resource</span>
          </button>
        )}
      </div>

      {/* Main Resource Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${getCategoryBadgeClass(
              resource.category
            )}`}
          >
            {resource.category}
          </span>

          {resource.course_code && (
            <span className="rounded-full bg-zinc-800/80 px-3 py-1 text-xs font-mono text-zinc-200 border border-zinc-700/60">
              {resource.course_code}
            </span>
          )}

          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400 border border-zinc-800">
            {resource.department}
          </span>

          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400 border border-zinc-800">
            {resource.semester} {resource.year}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {resource.title}
        </h1>

        {/* Course Name */}
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <BookOpen className="h-4 w-4 text-red-500 shrink-0" />
          <span className="font-semibold">{resource.course_name}</span>
        </div>

        {/* Description */}
        <div className="border-t border-zinc-800/80 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Overview &amp; Topics
          </h3>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {resource.description}
          </p>
        </div>

        {/* Optional Note (if present) */}
        {resource.optional_note && (
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Uploader's Note
            </span>
            <p className="text-xs text-amber-200/90 leading-relaxed whitespace-pre-line">
              {resource.optional_note}
            </p>
          </div>
        )}

        {/* Meta Bar: Uploader & Voting */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-800/80 pt-5 text-xs text-zinc-400">
          {/* Uploader info */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-sm font-semibold text-red-400">
              {resource.uploader_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">
                Provided by {resource.uploader_name}
                {resource.uploader_batch && (
                  <span className="text-zinc-400 ml-1">
                    (Batch {resource.uploader_batch})
                  </span>
                )}
                {resource.uploader_department && (
                  <span className="text-zinc-400 ml-1.5 font-normal">
                    &bull; {resource.uploader_department}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-zinc-500">
                Released on {formatDateDDMMYYYY(resource.created_at)}
              </p>
            </div>
          </div>

          {/* Voting Action Section */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 mr-1">Community Score:</span>
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 shadow-inner">
              <button
                onClick={() => handleVote(1)}
                title="Upvote this resource"
                className={`flex cursor-pointer items-center gap-1.5 px-2 py-1 rounded-lg transition-all active:scale-95 ${resource.user_vote === 1
                  ? 'text-emerald-400 bg-emerald-950/60 font-semibold'
                  : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50'
                  }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs">Upvote</span>
              </button>

              <div
                className={`px-2 py-0.5 text-sm font-bold min-w-[28px] text-center ${resource.vote_score > 0
                  ? 'text-emerald-400'
                  : resource.vote_score < 0
                    ? 'text-red-400'
                    : 'text-zinc-400'
                  }`}
              >
                {resource.vote_score}
              </div>

              <button
                onClick={() => handleVote(-1)}
                title="Downvote this resource"
                className={`flex cursor-pointer items-center gap-1.5 px-2 py-1 rounded-lg transition-all active:scale-95 ${resource.user_vote === -1
                  ? 'text-red-400 bg-red-950/60 font-semibold'
                  : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50'
                  }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-xs">Downvote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Attached Documents */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Attached Documents ({resource.documents.length})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click to view or download directly from cloud storage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {resource.documents.map((doc, idx) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    {doc.file_type && (
                      <span className="uppercase font-mono font-semibold text-zinc-300">
                        {doc.file_type}
                      </span>
                    )}
                    {doc.file_size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* View / Download Action */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View / Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirmOpen(false)}
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
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{resource.title}"</strong> and all
              its attached documents? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteConfirmOpen(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="btn-accent inline-flex items-center gap-1.5 text-xs py-2 px-4 disabled:opacity-50"
              >
                {deleting ? (
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
