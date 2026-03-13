import { useCallback } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

/**
 * Simple regex-based KQL tokenizer for syntax highlighting.
 * Tokens: keywords, operators, strings, comments, pipe.
 */
function tokenizeKql(kql: string): Array<{ type: string; text: string }> {
  const tokens: Array<{ type: string; text: string }> = [];
  const keywordRegex = /\b(let|where|project|extend|summarize|join|sort|order|by|count|dcount|make_set|bin|ago|has_any|contains|in~|!in~|==|!=|and|or|in\b)\b/gi;
  const pipeRegex = /\|/g;
  const commentRegex = /\/\/[^\n]*/g;
  const stringRegex = /"(?:[^"\\]|\\.)*"|'[^']*'/g;

  const sources: Array<{ start: number; end: number; type: string }> = [];

  function addMatch(regex: RegExp, type: string): void {
    let m: RegExpExecArray | null;
    // Safe: regex.source and regex.flags come from static, hard-coded regex values in this module.
    // eslint-disable-next-line security/detect-non-literal-regexp
    const re = new RegExp(regex.source, regex.flags);
    while ((m = re.exec(kql)) !== null) {
      sources.push({ start: m.index, end: m.index + m[0].length, type });
    }
  }

  addMatch(keywordRegex, "keyword");
  addMatch(pipeRegex, "pipe");
  addMatch(commentRegex, "comment");
  addMatch(stringRegex, "string");

  sources.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number; type: string }> = [];
  for (const s of sources) {
    const last = merged[merged.length - 1];
    if (last && s.start < last.end) continue;
    merged.push(s);
  }

  let pos = 0;
  for (const s of merged) {
    if (s.start > pos) {
      tokens.push({ type: "text", text: kql.slice(pos, s.start) });
    }
    tokens.push({ type: s.type, text: kql.slice(s.start, s.end) });
    pos = s.end;
  }
  if (pos < kql.length) {
    tokens.push({ type: "text", text: kql.slice(pos) });
  }
  return tokens;
}

const TOKEN_CLASSES: Record<string, string> = {
  keyword: "text-blue-400",
  pipe: "text-amber-400",
  comment: "text-gray-500",
  string: "text-green-400",
  text: "text-gray-300",
};

export interface KqlCodeBlockProps {
  kql: string;
  maxHeight?: string;
}

export function KqlCodeBlock({ kql, maxHeight = "20rem" }: KqlCodeBlockProps) {
  const { copy, copied } = useCopyToClipboard();

  const handleCopy = useCallback(() => {
    void copy(kql);
  }, [copy, kql]);

  const tokens = tokenizeKql(kql);

  return (
    <div className="relative rounded border border-white/10 bg-[#1e1e1e] font-mono text-sm">
      <div className="flex justify-end border-b border-white/10 px-2 py-1">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={copied ? "Copied" : "Copy KQL"}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-auto p-3 text-left whitespace-pre-wrap break-words"
        style={{ maxHeight }}
      >
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={TOKEN_CLASSES[t.type] ?? TOKEN_CLASSES.text}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
