'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getHelpdeskPostById } from '@/lib/api/helpdesk';
import { HelpdeskPost } from '@/types/helpdesk';
import MarkdownRenderer from '@/components/helpdesk/MarkdownRenderer';
import StepByStepGuide from '@/components/helpdesk/StepByStepGuide';
import AttachmentList from '@/components/helpdesk/AttachmentList';
import { formatDateTimeDDMMYYYY } from '@/lib/formatters';
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Calendar,
  UserCheck,
  Tag,
  Edit3,
  Loader2,
  HelpCircle,
  Share2,
  Check,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function HelpdeskDetailPage({ params }: PageProps) {
  const { postId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<HelpdeskPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadPost() {
      setLoading(true);
      try {
        const data = await getHelpdeskPostById(postId);
        setPost(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load Helpdesk topic');
        router.push('/helpdesk');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId, router]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAcademic = post.post_type === 'academic';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-16">
      {/* Top Navigation Bar / Breadcrumb */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/helpdesk"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Smart Helpdesk
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Share'}
            </button>

            {user?.role === 'helpdesk_admin' && (
              <Link
                href={`/helpdesk-dashboard/${post.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Topic
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 space-y-8">
        {/* Header Block */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold tracking-wide uppercase shadow-sm ${isAcademic
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
            >
              {isAcademic ? (
                <>
                  <GraduationCap className="h-3.5 w-3.5" />
                  Academic Regulation
                </>
              ) : (
                <>
                  <Building2 className="h-3.5 w-3.5" />
                  Campus Facility
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-400 border border-zinc-700/60">
              <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
              Official Verification
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {post.title}
          </h1>

          {/* Meta Info Bar: Provided By & Last Updated */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <span>
                Provided By:{' '}
                <strong className="text-zinc-200 font-semibold">{post.provided_by}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span>
                Last Updated:{' '}
                <strong className="text-zinc-200 font-semibold">
                  {formatDateTimeDDMMYYYY(post.updated_at)}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm">
          <div className="mb-4 pb-3 border-b border-zinc-800/80">
            <h2 className="text-base font-bold text-zinc-200">Information & Guidance</h2>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-200">
            <MarkdownRenderer content={post.description} />
          </div>
        </div>

        {/* Step-by-Step Guide Section */}
        <StepByStepGuide steps={post.steps} />

        {/* Attachments Section */}
        <AttachmentList attachments={post.attachments} />

        {/* Keywords Tags */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 backdrop-blur-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-zinc-500" />
              Topic Keywords & Search Terms
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800/70 px-2.5 py-1 text-xs text-zinc-200"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
