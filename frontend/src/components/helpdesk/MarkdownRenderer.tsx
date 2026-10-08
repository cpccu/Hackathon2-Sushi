'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  let inList = false;
  let listItems: string[] = [];
  let listOrdered = false;

  const flushTable = () => {
    if (inTable && (tableHeader.length > 0 || tableRows.length > 0)) {
      blocks.push(
        <div key={`table-${blocks.length}`} className="my-5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          <table className="w-full text-left text-xs sm:text-sm">
            {tableHeader.length > 0 && (
              <thead className="bg-zinc-900/90 text-zinc-200 border-b border-zinc-800 font-semibold">
                <tr>
                  {tableHeader.map((th, idx) => (
                    <th key={idx} className="px-4 py-2.5 sm:px-5 sm:py-3 font-semibold text-zinc-100">
                      {renderInline(th)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-zinc-850">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-900/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 sm:px-5 sm:py-3 text-zinc-300">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (listOrdered) {
        blocks.push(
          <ol key={`ol-${blocks.length}`} className="my-4 list-decimal space-y-1.5 pl-6 text-xs sm:text-sm text-zinc-300">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="my-4 list-disc space-y-1.5 pl-6 text-xs sm:text-sm text-zinc-300">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      }
      inList = false;
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // If it's a separator line like |---|---|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        // Table divider, skip
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Check for lists
    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

    if (unorderedMatch) {
      if (inList && listOrdered) flushList();
      inList = true;
      listOrdered = false;
      listItems.push(unorderedMatch[1]);
      continue;
    } else if (orderedMatch) {
      if (inList && !listOrdered) flushList();
      inList = true;
      listOrdered = true;
      listItems.push(orderedMatch[2]);
      continue;
    } else {
      flushList();
    }

    // Empty lines
    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} className="mt-6 mb-2 text-base font-semibold text-zinc-100">
          {renderInline(trimmed.substring(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="mt-8 mb-3 text-lg font-bold text-zinc-50 border-b border-zinc-800/80 pb-1.5">
          {renderInline(trimmed.substring(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} className="mt-8 mb-4 text-xl font-bold text-white">
          {renderInline(trimmed.substring(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-2 border-red-500/80 bg-red-950/20 px-4 py-2 text-xs sm:text-sm italic text-zinc-300 rounded-r-lg"
        >
          {renderInline(trimmed.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushTable();
  flushList();

  return <div className="space-y-1">{blocks}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Parse bold (**text**), links ([text](url)), code (`code`)
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(parseFormatting(text.substring(lastIndex, match.index)));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={`link-${match.index}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-0.5"
      >
        {linkText}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(parseFormatting(text.substring(lastIndex)));
  }

  return parts;
}

function parseFormatting(text: string): React.ReactNode {
  // Parse **bold** and `code`
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(parseCode(text.substring(lastIndex, match.index)));
    }
    parts.push(
      <strong key={`b-${match.index}`} className="font-semibold text-zinc-100">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(parseCode(text.substring(lastIndex)));
  }

  return parts;
}

function parseCode(text: string): React.ReactNode {
  const codeRegex = /`([^`]+)`/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <code
        key={`c-${match.index}`}
        className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-red-300"
      >
        {match[1]}
      </code>
    );
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
