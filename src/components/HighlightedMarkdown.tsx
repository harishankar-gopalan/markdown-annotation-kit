import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef } from "react";
import { ParsedMark } from "../utils/mark";

interface HighlightedMarkdownProps {
  content: string;
  marks: ParsedMark[];
  highlightRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  onHighlightClick: (id: number) => void;
}

function buildHighlighted(
  clean: string,
  marks: ParsedMark[]
): string | { html: string; codeBlockMarks: ParsedMark[]; clean: string } {
  // First, clean up any unresolved 'mark' tags that might remain (as a safety measure).
  // This prevents 'mark' tags from being displayed as plain text if the code block detection logic fails.
  const sanitizedClean = clean.replace(/<mark_\d+>/g, "").replace(/<\/mark_\d+>/g, "");

  if (marks.length === 0) return sanitizedClean;

  // Detect which annotations are within code blocks
  const codeBlockRanges: Array<{ start: number; end: number }> = [];
  let inCodeBlock = false;
  let codeBlockStart = 0;

  for (let i = 0; i < sanitizedClean.length; i++) {
    if (sanitizedClean.startsWith("```", i)) {
      const beforeIsNewline =
        i === 0 || sanitizedClean[i - 1] === "\n" || sanitizedClean[i - 1] === "\r";
      const afterChar = i + 3 < sanitizedClean.length ? sanitizedClean[i + 3] : "";
      const isCodeBlockMarker =
        beforeIsNewline &&
        (afterChar === "\n" ||
          afterChar === "\r" ||
          afterChar === "" ||
          /[a-zA-Z0-9\s]/.test(afterChar));

      if (isCodeBlockMarker) {
        if (inCodeBlock) {
          // End of code block
          codeBlockRanges.push({ start: codeBlockStart, end: i });
          inCodeBlock = false;
        } else {
          // Code block starts
          codeBlockStart = i;
          inCodeBlock = true;
        }
        i += 2; // jump over ```
        continue;
      }
    }
  }

  // If the code block has not ended, record it at the end.
  if (inCodeBlock) {
    codeBlockRanges.push({ start: codeBlockStart, end: sanitizedClean.length });
  }

  // Check if the annotation is within a code block
  const isMarkInCodeBlock = (mark: ParsedMark): boolean => {
    return codeBlockRanges.some((range) => mark.start >= range.start && mark.end <= range.end);
  };

  // Separate annotations inside and outside code blocks
  const marksInCodeBlocks: ParsedMark[] = [];
  const marksOutsideCodeBlocks: ParsedMark[] = [];

  for (const m of marks) {
    if (
      m.start < 0 ||
      m.end < 0 ||
      m.start >= m.end ||
      m.start > sanitizedClean.length ||
      m.end > sanitizedClean.length
    ) {
      continue;
    }
    if (isMarkInCodeBlock(m)) {
      marksInCodeBlocks.push(m);
    } else {
      marksOutsideCodeBlocks.push(m);
    }
  }

  // Generate HTML for annotations outside of code blocks.
  let out = "";
  let cursor = 0;
  for (const m of marksOutsideCodeBlocks) {
    out += sanitizedClean.slice(cursor, m.start);
    out += `<span class="annotation-highlight" data-id="${m.id}">`;
    out += sanitizedClean.slice(m.start, m.end);
    out += "</span>";
    cursor = m.end;
  }
  out += sanitizedClean.slice(cursor);

  return { html: out, codeBlockMarks: marksInCodeBlocks, clean: sanitizedClean };
}

export function HighlightedMarkdown({
  content,
  marks,
  highlightRefs,
  onHighlightClick,
}: HighlightedMarkdownProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const result = buildHighlighted(content, marks);
  const contentWithHighlights = typeof result === "string" ? result : result.html;
  const cleanContent = typeof result === "string" ? content : result.clean;

  // Apply highlighting within code blocks.
  useEffect(() => {
    const codeBlockMarks = typeof result === "string" ? [] : result.codeBlockMarks;
    if (!contentRef.current || codeBlockMarks.length === 0) return;

    const applyCodeBlockHighlights = () => {
      const preElements = contentRef.current?.querySelectorAll("pre code");
      if (!preElements || preElements.length === 0) return;

      // Find the locations of all code blocks within the clean content.
      const codeBlockRanges: Array<{ start: number; end: number; index: number }> = [];
      let inCodeBlock = false;
      let codeBlockStart = 0;
      let codeBlockIndex = 0;

      for (let i = 0; i < cleanContent.length; i++) {
        if (cleanContent.startsWith("```", i)) {
          const beforeIsNewline =
            i === 0 || cleanContent[i - 1] === "\n" || cleanContent[i - 1] === "\r";
          const afterChar = i + 3 < cleanContent.length ? cleanContent[i + 3] : "";
          const isCodeBlockMarker =
            beforeIsNewline &&
            (afterChar === "\n" ||
              afterChar === "\r" ||
              afterChar === "" ||
              /[a-zA-Z0-9\s]/.test(afterChar));

          if (isCodeBlockMarker) {
            if (inCodeBlock) {
              // End of code block
              let codeStart = codeBlockStart + 3; // jump over ```
              // Skip language identifier
              while (
                codeStart < cleanContent.length &&
                cleanContent[codeStart] !== "\n" &&
                cleanContent[codeStart] !== "\r"
              ) {
                codeStart++;
              }
              codeStart++; // Skip line breaks
              codeBlockRanges.push({ start: codeStart, end: i, index: codeBlockIndex });
              codeBlockIndex++;
              inCodeBlock = false;
            } else {
              // Code block starts
              codeBlockStart = i;
              inCodeBlock = true;
            }
            i += 2; // jump over ```
            continue;
          }
        }
      }

      // Apply annotations to each code block.
      codeBlockRanges.forEach((range) => {
        const preElement = preElements[range.index] as HTMLElement;
        if (!preElement) return;

        const codeText = preElement.textContent || "";
        if (!codeText) return;

        // Find the annotations within the scope of this code block.
        const marksInThisBlock = codeBlockMarks.filter(
          (mark: ParsedMark) => mark.start >= range.start && mark.end <= range.end
        );

        if (marksInThisBlock.length === 0) return;

        // Process positions from back to front to avoid positional shifts.
        marksInThisBlock
          .sort((a, b) => b.start - a.start)
          .forEach((mark: ParsedMark) => {
            const markText = cleanContent.slice(mark.start, mark.end);
            const markStartInCode = mark.start - range.start;

            // Find the location of a match within the code block text.
            const markIndex = codeText.indexOf(markText, Math.max(0, markStartInCode - 10));
            if (markIndex === -1) return;

            // Use TreeWalker to find the corresponding text node.
            const walker = document.createTreeWalker(preElement, NodeFilter.SHOW_TEXT, null);
            let textNode: Node | null = null;
            let offset = 0;
            let targetNode: Node | null = null;
            let targetOffset = 0;

            while ((textNode = walker.nextNode())) {
              const nodeLength = textNode.textContent?.length || 0;
              if (offset + nodeLength >= markIndex) {
                targetNode = textNode;
                targetOffset = markIndex - offset;
                break;
              }
              offset += nodeLength;
            }

            if (targetNode) {
              try {
                const range = document.createRange();
                range.setStart(targetNode, targetOffset);
                range.setEnd(
                  targetNode,
                  Math.min(targetOffset + markText.length, targetNode.textContent?.length || 0)
                );

                const span = document.createElement("span");
                span.className = "annotation-highlight";
                span.setAttribute("data-id", String(mark.id));
                span.style.textDecoration = "underline";
                span.style.textDecorationColor = "var(--markdown-annotator-primary)";
                span.style.textDecorationThickness = "2px";
                span.style.textUnderlineOffset = "4px";
                span.style.cursor = "pointer";
                span.onclick = () => onHighlightClick(mark.id);

                range.surroundContents(span);
                highlightRefs.current[mark.id] = span;
              } catch (e) {
                console.warn("Failed to highlight code block annotation:", e);
              }
            }
          });
      });
    };

    // Delay execution to ensure the DOM has rendered.
    const timer = setTimeout(applyCodeBlockHighlights, 100);
    return () => clearTimeout(timer);
  }, [content, marks, cleanContent, highlightRefs, onHighlightClick, result]);

  return (
    <div ref={contentRef} className="markdown-annotator-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          span: ({ className, children, ...props }) => {
            if (className === "annotation-highlight") {
              const id = Number((props as { "data-id"?: string })["data-id"]);
              return (
                <span
                  ref={(el) => (highlightRefs.current[id] = el)}
                  className="annotation-highlight"
                  onClick={() => onHighlightClick(id)}
                >
                  {children}
                </span>
              );
            }
            return <span {...props}>{children}</span>;
          },
          // All other elements use default rendering, with styles controlled by CSS.
        }}
      >
        {contentWithHighlights}
      </ReactMarkdown>
    </div>
  );
}
