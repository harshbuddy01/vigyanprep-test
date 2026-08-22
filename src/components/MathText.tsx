import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  text: string;
  className?: string;
}

function formatImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/')) {
    const apiBase = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';
    return `${apiBase.replace(/\/+$/, '')}${trimmed}`;
  }
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return 'https://lh3.googleusercontent.com/d/' + driveMatch[1];
  }
  return trimmed;
}

// Render Table Cell with Badge formatting for Student CBT
function renderTableCellContent(cell: string) {
  const trimmed = cell.replace(/^\*\*|\*\*$/g, '').trim();
  if (!trimmed) return null;

  const matchCol1 = trimmed.match(/^(\([A-D]\)|[A-D]\))\s*([\s\S]*)$/i);
  const matchCol2 = trimmed.match(/^(\([P-S]\)|[P-S]\))\s*([\s\S]*)$/i);

  if (matchCol1) {
    const badge = matchCol1[1].replace(/[^A-D]/gi, '').toUpperCase();
    const rest = matchCol1[2].trim();
    return (
      <div className="flex items-start gap-2">
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold font-mono text-xs shrink-0 border border-amber-300 dark:border-amber-500/30">
          ({badge})
        </span>
        <div className="flex-1 leading-relaxed">
          <MathText text={rest} />
        </div>
      </div>
    );
  }

  if (matchCol2) {
    const badge = matchCol2[1].replace(/[^P-S]/gi, '').toUpperCase();
    const rest = matchCol2[2].trim();
    return (
      <div className="flex items-start gap-2">
        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold font-mono text-xs shrink-0 border border-blue-300 dark:border-blue-500/30">
          ({badge})
        </span>
        <div className="flex-1 leading-relaxed">
          <MathText text={rest} />
        </div>
      </div>
    );
  }

  return <MathText text={trimmed} />;
}

// Render Markdown Table in Student CBT Portal
function renderTableBlock(tableText: string, keyPrefix: string | number) {
  const lines = tableText.trim().split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return null;

  const headerCells = lines[0].split('|').slice(1, -1).map(c => c.trim().replace(/^\*\*|\*\*$/g, ''));
  const dataLines = lines.filter((l, idx) => idx > 0 && !/^\|[\s\-:\|]+\|$/.test(l.trim()));
  const rows = dataLines
    .map(r => r.split('|').slice(1, -1).map(c => c.trim()))
    .filter(row => row.some(cell => cell.replace(/^(\(\w\)|[\*\s])+$/g, '').trim().length > 0));

  if (rows.length === 0) return null;

  return (
    <div key={keyPrefix} className="my-3.5 overflow-x-auto rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/80 shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[340px]">
        <thead>
          <tr className="bg-gray-200/90 dark:bg-zinc-800 border-b border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-amber-400 font-extrabold uppercase tracking-wider">
            {headerCells.map((h, i) => (
              <th key={i} className="py-2.5 px-4 font-bold border-r border-gray-300 dark:border-zinc-700/50 last:border-r-0">
                <MathText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/70 dark:bg-zinc-900/40'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="py-2.5 px-4 text-gray-800 dark:text-zinc-200 leading-relaxed border-r border-gray-200 dark:border-zinc-800/50 last:border-r-0 font-medium">
                  {renderTableCellContent(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Render formatted line/text chunk with inline math & bold text
function renderInlineContent(rawChunk: string) {
  if (!rawChunk) return null;

  const parts = rawChunk.split(/(\$\$[^\$]+\$\$|\$[^\$\n\r]+\$|\\\(.*?\\\)|\\\[.*?\\\]|\*\*[^\*\n\r]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        let isMath = false;
        let isDisplay = false;
        let mathContent = part;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          isMath = true;
          isDisplay = true;
          mathContent = part.slice(2, -2);
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          isMath = true;
          isDisplay = true;
          mathContent = part.slice(2, -2);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          isMath = true;
          isDisplay = false;
          mathContent = part.slice(1, -1);
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          isMath = true;
          isDisplay = false;
          mathContent = part.slice(2, -2);
        } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const boldContent = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-gray-900 dark:text-amber-200">
              {renderInlineContent(boldContent)}
            </strong>
          );
        }

        if (isMath) {
          try {
            const html = katex.renderToString(mathContent.trim(), {
              displayMode: isDisplay,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className={isDisplay ? 'block my-2 text-center overflow-x-auto py-1' : 'inline-block px-0.5'}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={index} className="text-amber-600 font-mono text-xs">
                {part}
              </span>
            );
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export const MathText: React.FC<Props> = ({ text, className = '' }) => {
  if (!text) return null;

  const trimmedText = text.trim();
  if (/^https?:\/\/[^\s]+$/i.test(trimmedText) && (
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmedText) ||
    /googleusercontent\.com/i.test(trimmedText) ||
    /drive\.google\.com/i.test(trimmedText)
  )) {
    const formattedUrl = formatImageUrl(trimmedText);
    return (
      <span className={'block my-1.5 text-center ' + className}>
        <img
          src={formattedUrl}
          alt="Option Diagram"
          className="max-h-48 mx-auto object-contain rounded-xl border border-gray-200 shadow-sm bg-white p-1"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </span>
    );
  }

  const sanitized = text
    .replace(/5Õ|5Ö|5Ô/g, "5'")
    .replace(/3Õ|3Ö|3Ô/g, "3'")
    .replace(/Õ|Ö|Ô/g, "'")
    .replace(/[\x0c\u000c]rac\{/g, "\\frac{")
    .replace(/(^|[^a-zA-Z\\])rac\{/g, "$1\\frac{")
    .replace(/(^|[^a-zA-Z\\])qrt\{/g, "$1\\sqrt{")
    .replace(/[\x08\u0008]eta/g, "\\beta")
    .replace(/[\x0b\u000b]eta/g, "\\theta");

  // Check for Markdown Table blocks
  const tableRegex = /(\n?\|[^\r\n]+\|[\r\n]+\|[\s\-:\|]+\|[\r\n]+(?:\|[^\r\n]+\|[\r\n]?)+)/g;
  if (tableRegex.test(sanitized)) {
    const segments = sanitized.split(tableRegex);
    return (
      <span className={'inline-wrap leading-relaxed ' + className}>
        {segments.map((seg: string, sIdx: number) => {
          if (!seg) return null;
          if (seg.trim().startsWith('|') && seg.includes('\n')) {
            return renderTableBlock(seg, sIdx);
          }
          return <MathText key={sIdx} text={seg} className={className} />;
        })}
      </span>
    );
  }

  // Process line by line for structured statements & clean paragraphs
  const lines = sanitized.split(/\r?\n/);

  return (
    <div className={'space-y-2.5 leading-relaxed ' + className}>
      {lines.map((line: string, lIdx: number) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          return <div key={lIdx} className="h-1.5" />;
        }

        // Check if line is an image
        const imageRegex = /^(!\[(.*?)\]\((.*?)\)|\[(?:img|image):\s*(.*?)\]|\{\{(https?:\/\/.*?)\}\}|https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp|svg))$/i;
        const imgMatch = trimmedLine.match(imageRegex);
        if (imgMatch) {
          const rawUrl = imgMatch[3] || imgMatch[4] || imgMatch[5] || imgMatch[0];
          const alt = imgMatch[2] || 'Diagram';
          const formattedUrl = formatImageUrl(rawUrl);
          return (
            <div key={lIdx} className="my-3 text-center">
              <img
                src={formattedUrl}
                alt={alt}
                className="max-h-80 mx-auto object-contain rounded-xl border-2 border-amber-950/20 shadow-md bg-white p-1.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          );
        }

        // Check if line is a numbered statement
        const statementMatch = trimmedLine.match(/^(\([0-9ivxIVX]+\)|[0-9ivxIVX]+[\.\)]|Statement\s+[0-9IVX]+:?|Assertion\s*\([A-Z]\):?|Reason\s*\([A-Z]\):?|\b[1-9]\b(?=\s+[A-Za-z]))\s*([\s\S]*)$/i);

        if (statementMatch) {
          const badge = statementMatch[1].trim();
          const content = statementMatch[2].trim();
          return (
            <div key={lIdx} className="flex items-start gap-3 my-2.5 pl-2 sm:pl-3.5 group">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-extrabold font-mono text-xs shrink-0 border border-amber-300 dark:border-amber-500/30 shadow-xs">
                {badge.endsWith(':') || badge.endsWith('.') || badge.endsWith(')') ? badge : badge + '.'}
              </span>
              <div className="flex-1 leading-relaxed text-gray-900 dark:text-zinc-100 font-medium">
                {renderInlineContent(content)}
              </div>
            </div>
          );
        }

        return (
          <p key={lIdx} className="leading-relaxed text-gray-900 dark:text-zinc-100">
            {renderInlineContent(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
};
