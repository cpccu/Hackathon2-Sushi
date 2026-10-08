'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createHelpdeskPost, uploadHelpdeskAttachment } from '@/lib/api/helpdesk';
import { HelpdeskPostType, HelpdeskAttachment } from '@/types/helpdesk';
import StepBuilder from '@/components/helpdesk/StepBuilder';
import { formatFileSize } from '@/lib/formatters';
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Tag,
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateHelpdeskPostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState<HelpdeskPostType>('academic');
  const [description, setDescription] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<HelpdeskAttachment[]>([]);

  // UI / Upload states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Authentication & RBAC guard
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/helpdesk-dashboard/create');
        return;
      }
      if (user.role !== 'helpdesk_admin') {
        toast.error('Access restricted to Helpdesk Administrators');
        router.push('/helpdesk');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Keyword tags handling
  const handleAddKeyword = (val: string) => {
    const trimmed = val.trim().replace(/^#/, '');
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
    }
    setKeywordInput('');
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword(keywordInput);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // Attachment upload handling
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadHelpdeskAttachment(file);
        setAttachments((prev) => [
          ...prev,
          {
            title: uploaded.title || file.name,
            file_url: uploaded.file_url,
            file_type: uploaded.file_type || file.type,
            file_size: uploaded.file_size || file.size,
          },
        ]);
      }
      toast.success('Attachment uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a topic title');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Please provide a description of at least 10 characters');
      return;
    }

    // Filter out blank steps
    const cleanedSteps = steps.map((s) => s.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      const created = await createHelpdeskPost({
        title: title.trim(),
        post_type: postType,
        description: description.trim(),
        keywords,
        steps: cleanedSteps,
        attachments: attachments.map((att) => ({
          title: att.title,
          file_url: att.file_url,
          file_type: att.file_type || undefined,
          file_size: att.file_size || undefined,
        })),
      });

      toast.success('Helpdesk topic created successfully!');
      router.push(`/helpdesk/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create topic');
      setIsSubmitting(false);
    }
  };

  if (authLoading || (!user && !authLoading) || (user && user.role !== 'helpdesk_admin')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Top Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/60 sticky top-16 z-30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/helpdesk-dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-zinc-500 font-mono">NEW TOPIC</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Create Helpdesk Topic
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Publish verified information, policy guidelines, fee tables, or facility procedures.
          </p>
        </div>

        {/* Provided By Banner Note */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <UserCheck className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300">
            <span className="font-semibold text-white">Attribution Notice:</span> This topic will be
            published with <strong className="text-red-400 font-semibold">{user?.full_name}</strong> as
            the verified editor in &quot;Provided By&quot;.
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selector */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-4">
            <label className="block text-xs font-semibold text-zinc-300">
              Topic Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostType('academic')}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  postType === 'academic'
                    ? 'border-blue-500/80 bg-blue-500/10 shadow-lg shadow-blue-950/30'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    postType === 'academic' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Academic</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Institution rules, examination guidelines, admission fees, waiver policies, and graduation terms.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPostType('facilities')}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  postType === 'facilities'
                    ? 'border-emerald-500/80 bg-emerald-500/10 shadow-lg shadow-emerald-950/30'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    postType === 'facilities'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Facilities</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Canteen menus, library & Koha software, bus routes & transport schedules, computer labs, and rooms.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Topic Title */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-2">
            <label htmlFor="topic-title" className="block text-xs font-semibold text-zinc-300">
              Topic Title <span className="text-red-500">*</span>
            </label>
            <input
              id="topic-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Waiver Policy, Examination Rules, Bus Routes & Schedules"
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="topic-description" className="block text-xs font-semibold text-zinc-300">
                Detailed Information & Guidance <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-500">Markdown formatting supported</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Use markdown tables (`| Col 1 | Col 2 |`), lists (`* item`), bold (`**bold**`), and links (`[label](url)`).
            </p>
            <textarea
              id="topic-description"
              required
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide comprehensive details, rules, eligibility conditions, timings, or office locations..."
              className="w-full resize-y font-mono text-xs sm:text-sm rounded-xl border border-zinc-700/80 bg-zinc-950/80 p-4 text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Keywords */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Keywords & Tags
              </label>
              <p className="text-[11px] text-zinc-500">
                Add search keywords students might type (e.g. koha, transport, waiver, gpa, schedule).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Type keyword and press Enter..."
                className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddKeyword(keywordInput)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Add
              </button>
            </div>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/70 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-200"
                  >
                    <Tag className="h-3 w-3 text-zinc-400" />
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-zinc-400 hover:text-red-400 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step-by-Step Guide Builder */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <StepBuilder steps={steps} onChange={setSteps} />
          </div>

          {/* Attachments Section */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Official Attachments <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <p className="text-[11px] text-zinc-500">
                Upload routine PDFs, circular images, fee structures, or bus route timetables.
              </p>
            </div>

            {/* Upload button / Dropzone */}
            <label
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all ${
                isDragOver
                  ? 'border-red-500 bg-red-500/10 scale-[1.01]'
                  : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
              }`}
            >
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              {isUploading ? (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  <span>Uploading attachment to Cloudinary...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center pointer-events-none">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 mb-2">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    Click or drag files here to upload
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    PDF, Images, or Documents (up to 20MB)
                  </p>
                </div>
              )}
            </label>

            {/* Uploaded attachments list */}
            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/80 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                        {att.file_type?.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-red-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-zinc-200">
                          {att.title}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {formatFileSize(att.file_size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                      title="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/helpdesk-dashboard"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 shadow-md shadow-red-950/50 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Topic...
                </>
              ) : (
                'Publish Topic'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
