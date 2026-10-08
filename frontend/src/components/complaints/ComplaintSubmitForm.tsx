'use client';

import React, { useState, useRef } from 'react';
import {
  ComplaintCategory,
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  ComplaintAttachment,
} from '@/types/complaint';
import { createComplaint, uploadComplaintAttachment } from '@/lib/api/complaint';
import {
  X,
  ShieldAlert,
  UploadCloud,
  FileText,
  Loader2,
  Trash2,
  Send,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/formatters';

interface ComplaintSubmitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComplaintSubmitForm({
  isOpen,
  onClose,
  onSuccess,
}: ComplaintSubmitFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('academic');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{ title: string; file_url: string; file_type?: string; file_size?: number }>
  >([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      toast.error('You can upload up to 5 attachments per complaint.');
      return;
    }

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds the 10MB limit.`);
          continue;
        }

        const uploaded = await uploadComplaintAttachment(file);
        setAttachments((prev) => [
          ...prev,
          {
            title: uploaded.title || file.name,
            file_url: uploaded.file_url,
            file_type: uploaded.file_type,
            file_size: uploaded.file_size,
          },
        ]);
      }
      toast.success('File(s) uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload attachment');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 2) {
      toast.error('Title must be at least 2 characters long.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      toast.error('Description must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        attachments,
      });

      toast.success('Your anonymous complaint has been submitted successfully.');
      setTitle('');
      setCategory('academic');
      setDescription('');
      setAttachments([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Submit a Complaint
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Submit your concerns or feedback directly to the university administration.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Anonymous Guarantee Banner */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <span className="font-semibold text-red-300">Strictly Anonymous Guarantee: </span>
            Your identity is never stored in the database. Helpdesk administrators cannot see who
            submitted this complaint.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Projector not functioning in Room 402"
              maxLength={255}
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="complaint-category-field"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {COMPLAINT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="complaint-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the issue (what happened, date, location, etc.)..."
              rows={4}
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Attachments Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Supporting Attachments (Optional, max 5)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />

            <button
              type="button"
              disabled={uploadingFile || attachments.length >= 5}
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 p-4 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingFile ? (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  <span>Uploading attachment...</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-zinc-500" />
                  <span>
                    Click to browse files (PDF, Word documents, or images up to 10MB)
                  </span>
                </>
              )}
            </button>

            {/* Uploaded attachments list */}
            {attachments.length > 0 && (
              <div className="mt-2.5 space-y-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="h-4 w-4 text-red-400 shrink-0" />
                      <span className="truncate">{att.title}</span>
                      {att.file_size && (
                        <span className="text-zinc-500 shrink-0">
                          ({formatFileSize(att.file_size)})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                      title="Remove attachment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-complaint-btn"
              type="submit"
              disabled={submitting || uploadingFile}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition-all shadow-md shadow-red-950/40 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Anonymously
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
