'use client';

import React, { useState } from 'react';
import { HelpdeskAttachment } from '@/types/helpdesk';
import { formatFileSize } from '@/lib/formatters';
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  X,
  Maximize2,
} from 'lucide-react';

export interface GenericAttachment {
  id?: string;
  title: string;
  file_url: string;
  file_type?: string | null;
  file_size?: number | null;
}

interface AttachmentListProps {
  attachments?: (HelpdeskAttachment | GenericAttachment)[] | null;
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const isImage = (att: HelpdeskAttachment | GenericAttachment) => {
    if (att.file_type && att.file_type.startsWith('image/')) return true;
    const url = att.file_url.toLowerCase();
    return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp') || url.endsWith('.gif');
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
          <Paperclip className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100">Official Attachments</h3>
          <p className="text-xs text-zinc-400">
            {attachments.length} downloadable file{attachments.length > 1 ? 's' : ''} & documents
          </p>
        </div>
      </div>

      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {attachments.map((att, idx) => {
          const img = isImage(att);
          return (
            <div
              key={att.id || idx}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 transition-all hover:border-zinc-700 hover:bg-zinc-950"
            >
              <div className="flex items-start gap-3">
                {/* Icon or Thumbnail */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {img ? (
                    <ImageIcon className="h-5 w-5 text-red-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white">
                    {att.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {att.file_type || (img ? 'Image' : 'Document')}
                    {att.file_size ? ` • ${formatFileSize(att.file_size)}` : ''}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-zinc-900">
                {img && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage({ url: att.file_url, title: att.title })}
                    className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Preview
                  </button>
                )}

                <a
                  href={att.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-red-600/15 text-red-400 px-2.5 py-1 text-xs font-medium hover:bg-red-600/25 border border-red-500/30"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>

                <a
                  href={att.file_url}
                  download={att.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 rounded-md bg-zinc-900 p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80">
              <span className="truncate text-xs font-medium text-zinc-300">
                {previewImage.title}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] w-auto max-w-full rounded-b-xl object-contain mx-auto mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}
