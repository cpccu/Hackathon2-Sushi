'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ComplaintDetail, COMPLAINT_CATEGORY_LABELS } from '@/types/complaint';
import { getComplaintById } from '@/lib/api/complaint';
import ResponseList from '@/components/complaints/ResponseList';
import AddResponseForm from '@/components/complaints/AddResponseForm';
import AttachmentList from '@/components/helpdesk/AttachmentList';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Info,
  CheckCheck,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_STYLES: Record<string, string> = {
  academic: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  facilities: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  general: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  transport: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  hostel: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  other: 'bg-zinc-500/15 text-zinc-400 border-zinc-600/30',
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const complaintId = params.complaintId as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchComplaint = useCallback(async () => {
    if (!complaintId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComplaintById(complaintId);
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Complaint not found');
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="h-6 w-32 rounded bg-zinc-800 animate-pulse" />
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-8 space-y-4 animate-pulse">
          <div className="h-5 w-24 rounded bg-zinc-800" />
          <div className="h-8 w-3/4 rounded bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-800/60" />
          <div className="h-4 w-5/6 rounded bg-zinc-800/60" />
          <div className="h-4 w-2/3 rounded bg-zinc-800/60" />
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400 mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Complaint Not Found</h2>
        <p className="mt-1 text-sm text-zinc-400 max-w-md mx-auto">
          {error || 'The requested complaint could not be found or may have been removed.'}
        </p>
        <Link
          href="/complaints"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Link>
      </div>
    );
  }

  const categoryStyle =
    CATEGORY_STYLES[complaint.category] ?? 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Link>
      </div>

      {/* Main Complaint Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${categoryStyle}`}
            >
              {COMPLAINT_CATEGORY_LABELS[complaint.category] ?? complaint.category}
            </span>

            {user?.role === 'helpdesk_admin' && complaint.responded_by_me && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <CheckCheck className="h-3.5 w-3.5" />
                Responded by You
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              {formatDateDDMMYYYY(complaint.created_at)}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <MessageSquare className="h-3.5 w-3.5" />
              {complaint.response_count}{' '}
              {complaint.response_count === 1 ? 'Response' : 'Responses'}
            </span>
          </div>
        </div>

        {/* Complaint Title */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
          {complaint.title}
        </h1>

        {/* Anonymous Guarantee Notice */}
        <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-zinc-400">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-zinc-300">Anonymous Submission: </strong>
            This complaint is anonymous. The identity of the student who submitted it is not recorded
            in the system.
          </span>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Complaint Description
          </h2>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 sm:p-5 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Attachments Section if present */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="pt-2">
            <AttachmentList attachments={complaint.attachments as any} />
          </div>
        )}
      </div>

      {/* Responses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            Official Responses
            <span className="ml-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {complaint.responses?.length || 0}
            </span>
          </h2>
        </div>

        {/* Responses List */}
        <ResponseList responses={complaint.responses || []} />

        {/* Admin Add Response Form (only for helpdesk_admin) */}
        {user?.role === 'helpdesk_admin' && (
          <div className="pt-4">
            <AddResponseForm
              complaintId={complaint.id}
              onResponseAdded={fetchComplaint}
            />
          </div>
        )}
      </div>
    </div>
  );
}
