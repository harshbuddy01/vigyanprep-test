import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  text: string;
  className?: string;
}

export const MathText: React.FC<Props> = ({ text, className = '' }) => {
  if (!text) return null;

  // Clean common PDF encoding artifacts (e.g. 5Õ -> 5', 3Õ -> 3')
  const sanitized = text
    .replace(/5Õ|5Ö|5Ô/g, "5'")
    .replace(/3Õ|3Ö|3Ô/g, "3'")
    .replace(/Õ|Ö|Ô/g, "'");

  // Check if text contains LaTeX math delimiters
  const hasLatex = /\$|\\[(\[]/.test(sanitized);

  if (!hasLatex) {
    return <span className={className}>{sanitized}</span>;
  }

  // Parse inline and display math
  const parts = sanitized.split(/(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/gs);

  return (
    <span className={className}>
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
                className="inline-block px-0.5"
              />
            );
          } catch {
            return <span key={index}>{part}</span>;
          }
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
