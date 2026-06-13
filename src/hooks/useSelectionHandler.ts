import { useCallback, useRef, useState } from "react";
import { ParsedMark } from "../utils/mark";

export type { ParsedMark };

interface SelectionState {
  visible: boolean;
  x: number;
  y: number;
  height: number;
  text: string;
}

type SelectionEvent = MouseEvent | TouchEvent;

interface UseSelectionHandlerProps {
  markdownRef: React.RefObject<HTMLDivElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
  onSelection: (text: string, context: { before: string; after: string }) => void;
}

export function useSelectionHandler({
  markdownRef,
  popoverRef,
  onSelection,
}: UseSelectionHandlerProps) {
  const [selection, setSelection] = useState<SelectionState>({
    visible: false,
    x: 0,
    y: 0,
    height: 0,
    text: "",
  });

  const tempSelectionSpanRef = useRef<HTMLSpanElement | null>(null);
  const tempSelectionIdRef = useRef<string>("");
  const selectionContextRef = useRef<{ before: string; after: string } | null>(null);

  // Clear temporarily selected span
  const cleanupTempSelection = useCallback(() => {
    if (tempSelectionSpanRef.current) {
      const parent = tempSelectionSpanRef.current.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(tempSelectionSpanRef.current.textContent || ""),
          tempSelectionSpanRef.current
        );
        parent.normalize();
      }
      tempSelectionSpanRef.current = null;
      tempSelectionIdRef.current = "";
    }
  }, []);

  // Get the context of the selected text
  const getSelectionContext = useCallback(
    (range: Range, container: HTMLElement): { before: string; after: string } => {
      const contextLength = 50;

      const beforeRange = range.cloneRange();
      beforeRange.setStart(container, 0);
      beforeRange.setEnd(range.startContainer, range.startOffset);

      const beforeContainer = document.createDocumentFragment();
      beforeContainer.appendChild(beforeRange.cloneContents());
      let beforeText = beforeContainer.textContent || "";
      if (beforeText.length > contextLength) {
        beforeText = beforeText.slice(-contextLength);
      }

      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(container, container.childNodes.length);

      const afterContainer = document.createDocumentFragment();
      afterContainer.appendChild(afterRange.cloneContents());
      let afterText = afterContainer.textContent || "";
      if (afterText.length > contextLength) {
        afterText = afterText.slice(0, contextLength);
      }

      return { before: beforeText, after: afterText };
    },
    []
  );

  const handleSelection = useCallback(
    (event?: SelectionEvent) => {
      // If the clicked element is inside the pop-up window, do not process the selection logic.
      if (event) {
        const target = event.target as Node;
        if (popoverRef.current && popoverRef.current.contains(target)) {
          // Prevent the event from propagating further and avoid triggering other logic.
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }

      // If the pop-up is already displayed, check whether the click target is inside the pop-up.
      // If an element within the pop-up is clicked, neither the selection logic is processed nor the pop-up closed.
      if (selection.visible && event && popoverRef.current) {
        const target = event.target as Node;
        if (popoverRef.current.contains(target)) {
          // Clicking an element within the pop-up; the selection logic is not processed, and the pop-up is not closed.
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }

      cleanupTempSelection();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) {
        return;
      }

      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();
      if (!selectedText) {
        return;
      }

      if (!markdownRef.current) {
        setSelection((s) => ({ ...s, visible: false }));
        return;
      }

      if (markdownRef.current.contains(range.commonAncestorContainer)) {
        // Check if it is within the marked area.
        const checkIfInMarkedArea = (node: Node): boolean => {
          let parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
          while (parent && parent !== markdownRef.current) {
            if (parent.classList && parent.classList.contains("annotation-highlight")) {
              return true;
            }
            parent = parent.parentElement;
          }
          return false;
        };

        if (checkIfInMarkedArea(range.startContainer) || checkIfInMarkedArea(range.endContainer)) {
          return;
        }

        const context = getSelectionContext(range, markdownRef.current);
        selectionContextRef.current = context;

        // Wrap the selected text in a temporary span.
        try {
          const span = document.createElement("span");
          const tempId = `temp-selection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          span.setAttribute("data-temp-selection-id", tempId);
          span.style.backgroundColor = "rgba(255, 235, 59, 0.3)";
          span.style.borderBottom = "2px solid #ffc107";
          span.style.cursor = "pointer";

          range.surroundContents(span);
          tempSelectionSpanRef.current = span;
          tempSelectionIdRef.current = tempId;

          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          const height = rect.height;

          setSelection({
            visible: true,
            x,
            y,
            height,
            text: selectedText,
          });

          onSelection(selectedText, context);
        } catch (e) {
          console.warn("Failed to wrap selection with span:", e);
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          const height = rect.height;

          setSelection({
            visible: true,
            x,
            y,
            height,
            text: selectedText,
          });

          onSelection(selectedText, context);
        }
      } else {
        setSelection((s) => ({ ...s, visible: false }));
      }
    },
    [
      markdownRef,
      popoverRef,
      selection.visible,
      cleanupTempSelection,
      getSelectionContext,
      onSelection,
      setSelection,
    ]
  );

  return {
    selection,
    setSelection,
    handleSelection,
    cleanupTempSelection,
    selectionContextRef,
    tempSelectionSpanRef,
  };
}
