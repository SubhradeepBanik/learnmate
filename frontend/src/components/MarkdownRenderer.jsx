import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Preprocess LaTeX math syntax: converts \(...\) -> $...$ and \[...\] -> $$...$$
function preprocessLatex(text) {
  if (typeof text !== "string") return "";
  let cleaned = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `$$\n${eq.trim()}\n$$`);
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq.trim()}$`);
  return cleaned;
}

export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  const processedContent = preprocessLatex(content);

  return (
    <div className={`markdown-content text-[#173D2E] text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-lg sm:text-xl font-black text-[#143D2B] tracking-tight mt-5 mb-2.5 pb-1 border-b border-[#DDE8DC]" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base sm:text-lg font-black text-[#143D2B] tracking-tight mt-4 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm sm:text-base font-bold text-[#1B4332] tracking-tight mt-3 mb-1.5" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs sm:text-sm font-bold text-[#1B4332] mt-2.5 mb-1" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            return (
              <p className="mb-3 leading-relaxed text-[#143D2E] font-normal" {...props}>
                {children}
              </p>
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-extrabold text-[#143D2B]" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-[#1B4332]" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="mb-3.5 pl-5 list-disc space-y-1.5 marker:text-[#1B4332]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="mb-3.5 pl-5 list-decimal space-y-1.5 marker:text-[#1B4332] marker:font-bold" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-[#143D2E] leading-relaxed pl-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-3 border-l-4 border-[#A3BFA8] bg-[#DDE8DC]/40 pl-4 py-2 pr-2 text-xs sm:text-sm text-[#143D2B] rounded-r-xl italic shadow-sm" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const isInline = inline || !String(children).includes("\n");
            if (isInline) {
              return (
                <code className="rounded-md bg-[#DDE8DC]/80 px-1.5 py-0.5 font-mono text-[11px] sm:text-xs font-semibold text-[#143D2B] border border-[#A3BFA8]/40" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-2xl bg-[#143D2B] p-4 text-[#F5F7F2] overflow-x-auto shadow-md border border-[#A3BFA8]/20">
                <code className="font-mono text-xs leading-relaxed block" {...props}>
                  {children}
                </code>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="my-3.5 overflow-x-auto rounded-xl border border-[#DDE8DC] shadow-sm">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#DDE8DC]/80 text-[#143D2B] font-bold border-b border-[#DDE8DC]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="p-2.5 font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2.5 border-b border-[#DDE8DC] text-[#143D2E]" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[#1B4332] font-bold underline hover:text-[#143D2B] transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
