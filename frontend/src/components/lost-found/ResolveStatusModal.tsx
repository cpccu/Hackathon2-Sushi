'use client';

import React, { useState } from 'react';
import { resolveLostFoundPost } from '@/lib/api/lostFound';
import { CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ResolveStatusModalProps {
  postId: string;
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
  onResolved: () => void;
}

export default function ResolveStatusModal({
  postId,
  itemName,
  isOpen,
  onClose,
  onResolved,
}: ResolveStatusModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await resolveLostFoundPost(postId);
      toast.success('Post marked as resolved successfully!');
      onResolved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update post status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Mark as Resolved?
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Item: <span className="text-zinc-200 font-medium">{itemName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notice Body */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p>
            Marking this item as <strong>Resolved</strong> indicates that the item has been recovered or returned to its owner. This status will be displayed across the campus directory.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm & Resolve'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
