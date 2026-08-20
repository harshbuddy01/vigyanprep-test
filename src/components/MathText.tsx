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
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
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
      <span className={`block my-1.5 text-center ${className}`}>
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
    // Fix \frac corruption where \f becomes form-feed (\x0c) or gets stripped into "rac{"
    .replace(/[\x0c\u000c]rac\{/g, "\\frac{")
    .replace(/(^|[^a-zA-Z\\])rac\{/g, "$1\\frac{")
    .replace(/(^|[^a-zA-Z\\])qrt\{/g, "$1\\sqrt{")
    .replace(/[\x08\u0008]eta/g, "\\beta")
    .replace(/[\x0b\u000b]eta/g, "\\theta");

  // First split by inline markdown images: ![alt](url) or [img:url] or {{url}}
  const imageRegex = /(!\[.*?\]\(.*?\)|\[img:.*?\]|\{\{https?:\/\/.*?\}\})/gs;
  const blocks = sanitized.split(imageRegex);

  return (
    <span className={`inline-wrap ${className}`}>
      {blocks.map((block, bIdx) => {
        if (!block) return null;

        const mdMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/);
        const imgTagMatch = block.match(/^\[img:(.*?)\]$/);
        const curlyMatch = block.match(/^\{\{(https?:\/\/.*?)\}\}$/);

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
              } else if (part.startsWith('$') && part.endsWith('$')) {
                isMath = true;
                mathContent = part.slice(1, -1);
              } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
                isMath = true;
                mathContent = part.slice(2, -2);
              } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
                isMath = true;
                isDisplay = true;
                mathContent = part.slice(2, -2);
              }

              if (isMath) {
                try {
                  const html = katex.renderToString(mathContent, {
                    displayMode: isDisplay,
                    throwOnError: false
                  });
                  return (
                    <span
                      key={index}
                      dangerouslySetInnerHTML={{ __html: html }}
                      className={`inline-block px-0.5 max-w-full ${isDisplay ? 'block overflow-x-auto overflow-y-hidden my-2 py-1 scrollbar-thin' : 'overflow-x-auto'}`}
                    />
                  );
                } catch {
                  return <span key={index}>{part}</span>;
                }
              }

              // Auto-detect math constructs even if dollar signs were omitted
              if (/\\(frac|sqrt|vec|int|sum|alpha|beta|gamma|delta|theta|omega|pi|rho|lambda|sigma|mu|epsilon|infty|rightarrow|times|partial|mathrm|mathbf|gg|ll|left|right|pm|approx|neq|le|ge|cdot|binom|limits)/.test(part) || /\^{[^{}]*}|\_{[^{}]*}/.test(part)) {
                try {
                  const html = katex.renderToString(part, { displayMode: false, throwOnError: false });
                  return (
                    <span
                      key={index}
                      dangerouslySetInnerHTML={{ __html: html }}
                      className="inline-block px-0.5 max-w-full overflow-x-auto"
                    />
                  );
                } catch {
                  return <span key={index}>{part}</span>;
                }
              }

              return <span key={index}>{part}</span>;
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
