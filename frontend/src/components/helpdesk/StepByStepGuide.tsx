'use client';

import React from 'react';
import { ListOrdered, CheckCircle2, Info } from 'lucide-react';

interface StepByStepGuideProps {
  steps?: string[] | null;
}

export default function StepByStepGuide({ steps }: StepByStepGuideProps) {
  const hasSteps = Array.isArray(steps) && steps.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
          <ListOrdered className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100">Step-by-Step Guide</h3>
          <p className="text-xs text-zinc-400">
            {hasSteps ? `${steps.length} sequential procedure steps` : 'Actionable guide'}
          </p>
        </div>
      </div>

      <div className="pt-4">
        {!hasSteps ? (
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs sm:text-sm text-zinc-400">
            <Info className="h-4 w-4 shrink-0 text-zinc-500" />
            <span>No step-by-step guide for this information.</span>
          </div>
        ) : (
          <ol className="relative space-y-4 sm:space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
            {steps.map((step, idx) => (
              <li key={idx} className="relative flex items-start gap-3.5">
                {/* Step Circle Index */}
                <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-zinc-900 text-xs font-bold text-red-400 shadow-sm">
                  {idx + 1}
                </div>

                {/* Step Content */}
                <div className="min-w-0 flex-1 rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-3.5 transition-all hover:border-zinc-700/80">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400/90">
                      Step {idx + 1}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                    {step}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
