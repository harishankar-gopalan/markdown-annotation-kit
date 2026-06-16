import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { injectMarkTags, stripMarkTags, ParsedMark } from "./utils/mark";
import { getTextPositionByContext } from "./utils/positionCalculator";
import { AnnotationSidebar } from "./components/AnnotationSidebar";
import { HighlightedMarkdown } from "./components/HighlightedMarkdown";
import { PopoverEditor } from "./components/PopoverEditor";
import { useSelectionHandler } from "./hooks/useSelectionHandler";
import { createDebouncedPersistence } from "./utils/persistence";
import "./styles.css";

export type AnnotationItem = { id: number; note: string };

export type MarkdownAnnotatorProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  defaultAnnotations?: AnnotationItem[];
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (next: AnnotationItem[]) => void;
  /**
   * Persistence callback for annotation data changes
   * This function is automatically called when an annotation is added, edited, or deleted.
   * @param data The complete annotation data, including Markdown, the list of annotations, and marker positions.
   */
  onPersistence?: (data: {
    markdown: string;
    annotations: AnnotationItem[];
    marks: ParsedMark[];
    cleanMarkdown: string;
  }) => void | Promise<void>;
  /**
   * Debounce delay for the persistence callback (in milliseconds)
   * Default is 500ms; set to 0 to disable debouncing
   */
  persistenceDebounce?: number;
  className?: string;
};

function useControlled<T>(controlled: T | undefined, defaultValue: T) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  return [isControlled ? controlled : inner, setInner, isControlled] as const;
}

export function MarkdownAnnotator(props: MarkdownAnnotatorProps) {
  const {
    defaultValue = "",
    value,
    onChange,
    defaultAnnotations = [],
    annotations,
    onAnnotationsChange,
    onPersistence,
    persistenceDebounce = 500,
    className,
  } = props;

  const [rawMarkdown, setRawMarkdown, isMarkdownControlled] = useControlled<string>(
    value,
    defaultValue
  );
  const [ann, setAnn, isAnnControlled] = useControlled<AnnotationItem[]>(
    annotations,
    defaultAnnotations
  );

  const parse = useMemo(() => stripMarkTags(rawMarkdown), [rawMarkdown]);
  const clean = parse.clean;
  const marks = parse.marks;

  const highlightRefs = useRef<Record<number, HTMLElement | null>>({});
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const shouldPersistRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectionChangeTimeoutRef = useRef<number | null>(null);

  // Create a persistent callback (with debounce)
  const persistenceCallbackRef = useRef<ReturnType<typeof createDebouncedPersistence> | null>(null);

  useEffect(() => {
    if (onPersistence) {
      const delay = persistenceDebounce > 0 ? persistenceDebounce : 0;
      persistenceCallbackRef.current = delay
        ? createDebouncedPersistence((data) => {
            onPersistence({
              markdown: data.markdown,
              annotations: data.annotations,
              marks: data.marks,
              cleanMarkdown: data.cleanMarkdown,
            });
          }, delay)
        : (data: {
            markdown: string;
            annotations: AnnotationItem[];
            marks: ParsedMark[];
            cleanMarkdown: string;
            version: string;
            createdAt: number;
            updatedAt: number;
          }) => {
            onPersistence({
              markdown: data.markdown,
              annotations: data.annotations,
              marks: data.marks,
              cleanMarkdown: data.cleanMarkdown,
            });
          };
    } else {
      persistenceCallbackRef.current = null;
    }
  }, [onPersistence, persistenceDebounce]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setIsMobileLayout(false);
      return;
    }
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobileLayout);
  }, [isMobileLayout]);

  useEffect(() => {
    if (!shouldPersistRef.current) return;
    shouldPersistRef.current = false;
    if (persistenceCallbackRef.current) {
      persistenceCallbackRef.current({
        markdown: rawMarkdown,
        annotations: ann,
        marks: marks,
        cleanMarkdown: clean,
        version: "1.0.0",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
   }
  }, [rawMarkdown, ann, marks, clean]);

  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editValue, setEditValue] = useState<string>("");

  // Use selection handling hook
  const {
    selection,
    setSelection,
    handleSelection,
    cleanupTempSelection,
    selectionContextRef,
    tempSelectionSpanRef,
  } = useSelectionHandler({
    markdownRef,
    popoverRef,
    onSelection: useCallback(() => {
      // The selection processing logic has been implemented within the hook.
    }, []),
  });

  // Listen for mouse events
  const clearPendingSelection = useCallback(() => {
    if (selectionChangeTimeoutRef.current) {
      window.clearTimeout(selectionChangeTimeoutRef.current);
      selectionChangeTimeoutRef.current = null;
    }
  }, []);

  const scheduleHandleSelection = useCallback(
    (event?: MouseEvent | TouchEvent, immediate = false) => {
      clearPendingSelection();
      if (immediate) {
        handleSelection(event);
        return;
      }
      selectionChangeTimeoutRef.current = window.setTimeout(() => {
        handleSelection(event);
        selectionChangeTimeoutRef.current = null;
      }, 250);
    },
    [handleSelection, clearPendingSelection]
  );

  useEffect(() => {
    const onMouseDown = () => {
      pointerActiveRef.current = true;
      clearPendingSelection();
    };
    const onTouchStart = () => {
      pointerActiveRef.current = true;
      clearPendingSelection();
    };
    const onMouseUp = (event: MouseEvent) => {
      pointerActiveRef.current = false;
      scheduleHandleSelection(event, true);
    };
    const onTouchEnd = (event: TouchEvent) => {
      pointerActiveRef.current = false;
      scheduleHandleSelection(event, true);
    };
    const onTouchCancel = () => {
      pointerActiveRef.current = false;
      clearPendingSelection();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchCancel);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
      clearPendingSelection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleHandleSelection, clearPendingSelection]);

  useEffect(() => {
    const onSelectionChange = () => {
      if (pointerActiveRef.current) return;
      scheduleHandleSelection();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [scheduleHandleSelection]);

  // Synchronize with external annotations
  useEffect(() => {
    if (annotations && annotations.length) {
      setAnn(annotations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  // Confirm annotation
  const confirmAnnotation = useCallback(
    (note: string) => {
      const selectedText = selection.text;
      if (!selectedText || !markdownRef.current) {
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      // Prioritize using the context-based method (split + surrounding context) for precise localization.
      let position: { start: number; end: number } | null = null;

      if (selectionContextRef.current) {
        position = getTextPositionByContext(clean, selectedText, selectionContextRef.current);
      }

      // If the context method fails, try using the temporary span method.
      if (!position && tempSelectionSpanRef.current && markdownRef.current) {
        const span = tempSelectionSpanRef.current;

        const walker = document.createTreeWalker(markdownRef.current, NodeFilter.SHOW_TEXT, null);

        let textOffset = 0;
        let startOffset = -1;
        let endOffset = -1;
        let foundSpanStart = false;

        let node: Node | null;
        while ((node = walker.nextNode())) {
          const textNode = node as Text;
          const textLength = textNode.textContent?.length || 0;

          let parent = textNode.parentElement;
          let isInTempSpan = false;
          while (parent && parent !== markdownRef.current) {
            if (parent === span) {
              isInTempSpan = true;
              break;
            }
            parent = parent.parentElement;
          }

          if (isInTempSpan) {
            if (!foundSpanStart) {
              startOffset = textOffset;
              foundSpanStart = true;
            }
            textOffset += textLength;
            endOffset = textOffset;
          } else {
            if (!foundSpanStart) {
              textOffset += textLength;
            } else {
              break;
            }
          }
        }

        if (startOffset >= 0 && endOffset >= 0 && endOffset > startOffset) {
          position = { start: startOffset, end: endOffset };
        }
      }

      // Reject the tag if all methods fail.
      if (!position) {
        console.error("Failed to calculate accurate position for annotation");
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      const { start, end } = position;

      // Verify whether the location is within the valid range.
      if (start < 0 || end < 0 || start >= end || start > clean.length || end > clean.length) {
        console.error("Invalid position:", { start, end, cleanLength: clean.length });
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      // Verify whether the text at the corresponding location matches (using looser matching).
      const positionText = clean.slice(start, end);
      const normalizedPosition = positionText.replace(/\s+/g, " ").trim();
      const normalizedSelected = selectedText.replace(/\s+/g, " ").trim();
      if (
        positionText !== selectedText &&
        positionText.trim() !== selectedText.trim() &&
        normalizedPosition !== normalizedSelected &&
        !(normalizedPosition.length === normalizedSelected.length && normalizedPosition.length > 0)
      ) {
        console.error("Position text mismatch:", {
          positionText,
          selectedText,
          normalizedPosition,
          normalizedSelected,
          start,
          end,
        });
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      const maxId = ann.length ? Math.max(...ann.map((a) => a.id)) : 0;
      const newId = Math.max(maxId, marks.length ? Math.max(...marks.map((m) => m.id)) : 0) + 1;
      const nextRaw = injectMarkTags(rawMarkdown, parse.boundaryMap, start, end, newId);

      if (isMarkdownControlled) onChange && onChange(nextRaw);
      else setRawMarkdown(nextRaw);
      const nextAnn = [...ann, { id: newId, note }];
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn);
      else setAnn(nextAnn);

      // Trigger persistence callback
      shouldPersistRef.current = true

      // Clear temporary selection markers
      cleanupTempSelection();
      window.getSelection()?.removeAllRanges();
      setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      selection.text,
      clean,
      ann,
      marks,
      rawMarkdown,
      parse.boundaryMap,
      isMarkdownControlled,
      onChange,
      isAnnControlled,
      onAnnotationsChange,
      cleanupTempSelection,
      setSelection,
      selectionContextRef,
      tempSelectionSpanRef,
      setRawMarkdown,
      setAnn,
      shouldPersistRef,
    ]
  );

  // Anchor to Highlight
  const ensureSidebarVisible = useCallback(() => {
    if (isMobileLayout && !sidebarOpen) {
      setSidebarOpen(true);
      return true;
    }
    return false;
  }, [isMobileLayout, sidebarOpen]);

  const anchorToHighlight = useCallback(
    (idx: number) => {
      const item = ann[idx];
      if (!item) return;
      const openTriggered = ensureSidebarVisible();
      const scrollToHighlight = () => {
        const el = highlightRefs.current[item.id];
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.backgroundColor = "rgba(37, 99, 235, 0.2)";
        setTimeout(() => {
          if (el) el.style.backgroundColor = "transparent";
        }, 1000);
      };
      if (openTriggered) {
        setTimeout(scrollToHighlight, 300);
      } else {
        scrollToHighlight();
      }
    },
    [ann, ensureSidebarVisible]
  );

  // Process edits
  const handleEdit = useCallback(
    (idx: number, cancel?: boolean) => {
      if (cancel) {
        setEditIndex(-1);
        setEditValue("");
        return;
      }
      const item = ann[idx];
      if (!item) return;
      setEditIndex(idx);
      setEditValue(item.note);
    },
    [ann]
  );

  // Confirm Edit
  const confirmEdit = useCallback(
    (idx: number) => {
      if (!editValue.trim()) return;
      const next = ann.slice();
      next[idx] = { ...next[idx], note: editValue.trim() };
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(next);
      else setAnn(next);
      setEditIndex(-1);
      setEditValue("");

      // Trigger persistence callback
      shouldPersistRef.current = true
    },
    [editValue, ann, isAnnControlled, onAnnotationsChange, setAnn, shouldPersistRef]
  );

  // Delete comment
  const deleteAnnotation = useCallback(
    (idx: number) => {
      const item = ann[idx];
      if (!item) return;
      const id = item.id;
      const re = new RegExp(`<mark_${id}>(.*?)</mark_${id}>`, "g");
      const nextRaw = rawMarkdown.replace(re, "$1");
      if (isMarkdownControlled) onChange && onChange(nextRaw);
      else setRawMarkdown(nextRaw);
      const nextAnn = ann.filter((_, i) => i !== idx);
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn);
      else setAnn(nextAnn);
      delete highlightRefs.current[id];
      if (editIndex === idx) {
        setEditIndex(-1);
        setEditValue("");
      }
      shouldPersistRef.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      ann,
      rawMarkdown,
      isMarkdownControlled,
      onChange,
      isAnnControlled,
      onAnnotationsChange,
      editIndex,
      setRawMarkdown,
      setAnn,
    ]
  );

  // Highlight click handling
  const handleHighlightClick = useCallback(
    (id: number) => {
      const openTriggered = ensureSidebarVisible();
      const index = ann.findIndex((a) => a.id === id);
      if (index !== -1) {
        const cardEl = document.getElementById(`annotation-card-${index}`);
        if (cardEl) {
          const scrollCard = () => {
            cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
            (cardEl as HTMLElement).style.borderColor = "#2563eb";
            setTimeout(() => {
              (cardEl as HTMLElement).style.borderColor =
                editIndex === index ? "#2563eb" : "#e5e7eb";
            }, 1000);
          };
          if (openTriggered) {
            setTimeout(scrollCard, 300);
          } else {
            scrollCard();
          }
        }
      }
    },
    [ann, editIndex, ensureSidebarVisible]
  );

  // Cancel comment
  const handleCancelAnnotation = useCallback(() => {
    cleanupTempSelection();
    setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
    window.getSelection()?.removeAllRanges();
  }, [cleanupTempSelection, setSelection]);

  const toggleSidebar = useCallback(() => {
    if (isMobileLayout) {
      setSidebarOpen((prev) => !prev);
    }
  }, [isMobileLayout]);

  const closeSidebar = useCallback(() => {
    if (isMobileLayout) {
      setSidebarOpen(false);
    }
  }, [isMobileLayout]);

  const containerClasses = [
    "markdown-annotator-container",
    className || "",
    isMobileLayout ? "is-mobile" : "",
    sidebarOpen ? "sidebar-open" : "sidebar-collapsed",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div ref={markdownRef} className="markdown-annotator-markdown">
        <HighlightedMarkdown
          content={clean}
          marks={marks}
          highlightRefs={highlightRefs}
          onHighlightClick={handleHighlightClick}
        />
      </div>

      <AnnotationSidebar
        annotations={ann}
        editIndex={editIndex}
        editValue={editValue}
        onEdit={handleEdit}
        onEditChange={setEditValue}
        onConfirmEdit={confirmEdit}
        onDelete={deleteAnnotation}
        onAnchorToHighlight={anchorToHighlight}
      />

      {isMobileLayout && (
        <>
          <button className="markdown-annotator-sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "Collapse comments" : "View comments"}
          </button>
          {sidebarOpen && (
            <div
              className="markdown-annotator-sidebar-backdrop"
              onClick={closeSidebar}
              aria-label="Close the comments sidebar"
            />
          )}
        </>
      )}

      <PopoverEditor
        ref={popoverRef}
        visible={selection.visible}
        selectedText={selection.text}
        position={{ x: selection.x, y: selection.y, height: selection.height }}
        onConfirm={confirmAnnotation}
        onCancel={handleCancelAnnotation}
      />
    </div>
  );
}

export default MarkdownAnnotator;
