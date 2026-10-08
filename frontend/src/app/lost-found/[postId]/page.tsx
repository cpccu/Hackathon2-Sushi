'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLostFoundPostById } from '@/lib/api/lostFound';
import { LostFoundPost } from '@/types/lostFound';
import ImageGallery from '@/components/lost-found/ImageGallery';
import ResolveStatusModal from '@/components/lost-found/ResolveStatusModal';
import { formatDateDDMMYYYY } from '@/lib/formatters';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  Mail,
  Phone,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit3,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function PostDetailsPage({ params }: PageProps) {
  const { postId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<LostFoundPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadPost() {
      setLoading(true);
      try {
        const data = await getLostFoundPostById(postId);
        setPost(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load post details');
      } finally {
        setLoading(false);
      }
    }
    if (postId) loadPost();
  }, [postId]);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
    toast.success(`Copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-center p-4">
        <h2 className="text-xl font-bold text-zinc-100">Post Not Found</h2>
        <p className="mt-2 text-xs text-zinc-400">
          The requested Lost & Found report does not exist or may have been archived.
        </p>
        <Link href="/lost-found" className="btn-secondary mt-4 text-xs">
          Return to Directory
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === post.poster_id;
  const isLost = post.post_type === 'lost';
  const isResolved = post.status === 'resolved';

  return (
    <div className="min-h-screen bg-[#09090b] pb-20">
      {/* Top Breadcrumb */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Directory
          </Link>

          {/* Owner Quick Actions */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/lost-found/${post.id}/edit`}
                className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5 text-zinc-400" />
                Edit Post
              </Link>
              {!isResolved && (
                <button
                  onClick={() => setIsResolveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark as Resolved
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photos Gallery (1-3 images) */}
          <div className="lg:col-span-7 space-y-4">
            <ImageGallery images={post.images} itemName={post.item_name} />

            {/* Verification Note */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-200">
                  Institutional Security Notice
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Only contact the reporter if you have verified proof of ownership (e.g. university ID, distinctive identifiers, receipt, or password unlock).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Item Details & Poster Contact */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Badges / Title */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    isLost
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
                </span>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                    isResolved
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-amber-500/90 text-black'
                  }`}
                >
                  {isResolved ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Resolved / Recovered
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-black" />
                      Active Report
                    </>
                  )}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {post.item_name}
              </h1>

              {/* Meta information */}
              <div className="space-y-2 border-y border-zinc-800/80 py-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="font-medium text-zinc-400">Location:</span>
                  <span className="text-zinc-200">{post.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span className="font-medium text-zinc-400">
                    {isLost ? 'Lost On:' : 'Found On:'}
                  </span>
                  <span className="text-zinc-200">
                    {formatDateDDMMYYYY(post.incident_date)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Description
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
                  {post.description}
                </p>
              </div>

              {/* Keywords */}
              {post.keywords && post.keywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Tags & Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {post.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 border border-zinc-700/60"
                      >
                        <Tag className="h-3 w-3 text-zinc-500" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Poster Profile & Contact Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                Reporter Identity
              </h2>

              <div className="space-y-3">
                {/* Name */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                  <div className="rounded-lg bg-zinc-900 p-2 text-red-500 border border-zinc-800">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                      Reported By
                    </span>
                    <p className="text-sm font-semibold text-zinc-200">
                      {post.poster_name}
                    </p>
                  </div>
                </div>

                {/* Academic Affiliation */}
                {(post.poster_department || post.poster_batch) && (
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                    <div className="rounded-lg bg-zinc-900 p-2 text-zinc-400 border border-zinc-800">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                        Academic Department
                      </span>
                      <p className="text-xs font-medium text-zinc-300">
                        {post.poster_department || 'University Student'}
                        {post.poster_batch ? ` • Batch ${post.poster_batch}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Email */}
                {post.poster_email && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="rounded-lg bg-zinc-900 p-2 text-zinc-400 border border-zinc-800 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                          Email Address
                        </span>
                        <p className="truncate text-xs font-medium text-zinc-200">
                          {post.poster_email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <a
                        href={`mailto:${post.poster_email}?subject=Concerning your Lost%20%26%20Found item: ${encodeURIComponent(post.item_name)}`}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Email
                      </a>
                      <button
                        onClick={() => handleCopy(post.poster_email, 'email')}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Copy email"
                      >
                        {copiedEmail ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact Phone (if provided) */}
                {post.contact_phone && (
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="rounded-lg bg-zinc-900 p-2 text-zinc-400 border border-zinc-800 shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                          Phone Number
                        </span>
                        <p className="truncate text-xs font-medium text-zinc-200">
                          {post.contact_phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <a
                        href={`tel:${post.contact_phone}`}
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        Call
                      </a>
                      <button
                        onClick={() => handleCopy(post.contact_phone!, 'phone')}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Copy phone"
                      >
                        {copiedPhone ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {isResolveModalOpen && (
        <ResolveStatusModal
          postId={post.id}
          itemName={post.item_name}
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          onResolved={() => setPost({ ...post, status: 'resolved' })}
        />
      )}
    </div>
  );
}
