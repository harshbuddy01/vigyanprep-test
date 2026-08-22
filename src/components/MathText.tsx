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
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return 'https://lh3.googleusercontent.com/d/' + driveMatch[1];
  }
  return trimmed;
}

// Render Markdown Table (e.g. Matrix Match / List I & II) in Student CBT Portal
function renderTableBlock(tableText: string, keyPrefix: string | number) {
  const lines = tableText.trim().split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return null;

  const headerCells = lines[0].split('|').slice(1, -1).map(c => c.trim());
  const dataLines = lines.filter((l, idx) => idx > 0 && !/^\|[\s\-:\|]+\|$/.test(l.trim()));
  const rows = dataLines.map(r => r.split('|').slice(1, -1).map(c => c.trim()));

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
                  <MathText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

  // Clean common PDF encoding artifacts & corrupted form-feed/escaped LaTeX tokens
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
        {segments.map((seg, sIdx) => {
          if (!seg) return null;
          if (seg.trim().startsWith('|') && seg.includes('\n')) {
            return renderTableBlock(seg, sIdx);
          }
          return <MathText key={sIdx} text={seg} className={className} />;
        })}
      </span>
    );
  }

  // First split by inline markdown images: ![alt](url) or [img:url] or [image:url] or {{url}}
  const imageRegex = /(!\[.*?\]\(.*?\)|\[(?:img|image):.*?\]|\{\{https?:\/\/.*?\}\})/gis;
  const blocks = sanitized.split(imageRegex);

  return (
    <span className={'inline-wrap whitespace-pre-wrap leading-relaxed ' + className}>
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        const mdMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/i);
        const imgTagMatch = block.match(/^\[(?:img|image):\s*(.*?)\]$/i);
        const curlyMatch = block.match(/^\{\{(https?:\/\/.*?)\}\}/i);

        const imgUrl = mdMatch ? mdMatch[2] : imgTagMatch ? imgTagMatch[1] : curlyMatch ? curlyMatch[1] : null;
        const altText = mdMatch ? mdMatch[1] : 'Diagram';

        if (imgUrl) {
          const formattedUrl = formatImageUrl(imgUrl);
          return (
            <span key={bIdx} className="block my-3 text-center">
              <img
                src={formattedUrl}
                alt={altText}
                className="max-h-80 mx-auto object-contain rounded-xl border-2 border-amber-950/20 shadow-md bg-white p-1.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </span>
          );
        }

        // Parse inline and display math
        const parts = block.split(/(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/gs);

        return (
          <React.Fragment key={bIdx}>
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

              // Handle newlines explicitly so statements and paragraphs break cleanly
              if (part.includes('\n')) {
                const lines = part.split('\n');
                return (
                  <React.Fragment key={index}>
                    {lines.map((lineText, lIdx) => (
                      <React.Fragment key={lIdx}>
                        {lineText}
                        {lIdx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                );
              }

              return <span key={index}>{part}</span>;
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
