'use client';

import React, { useState } from 'react';
import { addComplaintResponse } from '@/lib/api/complaint';
import { Send, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AddResponseFormProps {
  complaintId: string;
  onResponseAdded: () => void;
}

export default function AddResponseForm({
  complaintId,
  onResponseAdded,
}: AddResponseFormProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Response message cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      await addComplaintResponse(complaintId, message.trim());
      toast.success('Official response posted successfully.');
      setMessage('');
      onResponseAdded();
    } catch (err: any) {
      toast.error(err.message || 'Failed to post response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          Add Official Response
        </h3>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
          Admin Action
        </span>
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        As a Helpdesk Administrator, your response will be published publicly on this complaint
        thread. <strong className="text-zinc-300">Responses are immutable</strong> and cannot be
        modified or deleted once posted.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          id="admin-response-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your official response, resolution details, or update for this complaint..."
          rows={4}
          required
          maxLength={5000}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {message.length} / 5000 characters
          </span>

          <button
            id="admin-submit-response-btn"
            type="submit"
            disabled={submitting || !message.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950/40 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting Response...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post Response
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
