'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';

interface StepBuilderProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export default function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const pendingFocusIndexRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const handleAddStep = () => {
    const newIdx = steps.length;
    pendingFocusIndexRef.current = newIdx;
    onChange([...steps, '']);
  };

  useEffect(() => {
    if (pendingFocusIndexRef.current !== null) {
      const idx = pendingFocusIndexRef.current;
      const timer = setTimeout(() => {
        const el = inputRefs.current[idx];
        if (el) {
          el.focus();
          pendingFocusIndexRef.current = null;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [steps]);

  const handleUpdateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...steps];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const updated = [...steps];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-zinc-300">
            Step-by-Step Guide <span className="text-zinc-500 font-normal">(Optional)</span>
          </label>
          <p className="text-[11px] text-zinc-500">
            Provide sequential instructions or procedure steps for students.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddStep}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-center">
          <ListOrdered className="mx-auto h-6 w-6 text-zinc-600 mb-1.5" />
          <p className="text-xs text-zinc-400">No steps added yet.</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Leave empty if this topic does not require sequential steps.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 transition-colors focus-within:border-zinc-700"
            >
              {/* Step Number Badge */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-red-400">
                {idx + 1}
              </div>

              {/* Textarea */}
              <div className="flex-1">
                <textarea
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                    if (pendingFocusIndexRef.current === idx && el) {
                      el.focus();
                      pendingFocusIndexRef.current = null;
                    }
                  }}
                  rows={2}
                  value={step}
                  onChange={(e) => handleUpdateStep(idx, e.target.value)}
                  placeholder={`Step ${idx + 1} instruction or detail...`}
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Action buttons (Move Up, Move Down, Delete) */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === steps.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="rounded p-1 text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                  title="Remove Step"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
