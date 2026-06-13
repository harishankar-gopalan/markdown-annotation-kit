import { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";

interface PopoverEditorProps {
  visible: boolean;
  selectedText: string;
  position: { x: number; y: number; height: number };
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 180;
const ARROW_SIZE = 8;
const GAP = 12;

export const PopoverEditor = forwardRef<HTMLDivElement, PopoverEditorProps>(
  ({ visible, selectedText, position, onConfirm, onCancel }, forwardedRef) => {
    const [note, setNote] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    // Expose the internal ref to the outside.
    useImperativeHandle(forwardedRef, () => popoverRef.current as HTMLDivElement, []);

    // Detect full-screen status and select the appropriate container.
    useEffect(() => {
      const getFullscreenElement = (): Element | null => {
        // Type Definition: Browser-prefixed properties
        interface DocumentWithPrefixes extends Document {
          webkitFullscreenElement?: Element | null;
          mozFullScreenElement?: Element | null;
          msFullscreenElement?: Element | null;
        }
        const doc = document as DocumentWithPrefixes;
        return (
          document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement ||
          null
        );
      };

      const updatePortalContainer = () => {
        const fullscreenElement = getFullscreenElement();
        if (fullscreenElement && fullscreenElement instanceof HTMLElement) {
          // If in full-screen mode, use the full-screen element as the container.
          setPortalContainer(fullscreenElement);
        } else {
          // Otherwise, use document.body
          setPortalContainer(document.body);
        }
      };

      // Initial Setup
      updatePortalContainer();

      // Listen for changes in full-screen status.
      const events = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ];

      events.forEach((event) => {
        document.addEventListener(event, updatePortalContainer);
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, updatePortalContainer);
        });
      };
    }, []);

    // Smart Positioning: Calculates the optimal position to avoid extending beyond the viewport.
    const popoverStyle = useMemo(() => {
      if (!visible || typeof window === "undefined" || !portalContainer) {
        return null;
      }

      // Get the full-screen element (if it exists)
      const getFullscreenElement = (): Element | null => {
        // Type Definition: Browser-prefixed properties
        interface DocumentWithPrefixes extends Document {
          webkitFullscreenElement?: Element | null;
          mozFullScreenElement?: Element | null;
          msFullscreenElement?: Element | null;
        }
        const doc = document as DocumentWithPrefixes;
        return (
          document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement ||
          null
        );
      };

      const fullscreenElement = getFullscreenElement();
      const isFullscreen = fullscreenElement !== null;

      // Get the container's boundary information.
      let containerRect: DOMRect;
      if (isFullscreen && fullscreenElement instanceof HTMLElement) {
        containerRect = fullscreenElement.getBoundingClientRect();
      } else {
        containerRect = {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        } as DOMRect;
      }

      // Position information of the selected text (relative to the viewport)
      const selectionTop = position.y;
      const selectionBottom = position.y + position.height;

      // Calculate the available space above and below (relative to the container).
      const spaceAbove = selectionTop - containerRect.top - 16;
      const spaceBelow = containerRect.top + containerRect.height - selectionBottom - 16;

      // Calculate the ideal position: put it at the top first to ensure that the selected text is not blocked
      let top: number;
      let placement: "top" | "bottom" = "top";

      // Calculate the ideal position above: the bottom of the popover should be above the top of the selected text, leaving sufficient space
      // Popover bottom = top + POPOVER_HEIGHT
      // Arrow extends downwards from the popover bottom by ARROW_SIZE (8px)
      // Arrow bottom = top + POPOVER_HEIGHT + ARROW_SIZE
      // Selected text top = selectionTop
      // Requirement: sufficient spacing (100px) between the arrow bottom and the selected text top
      // Therefore: top + POPOVER_HEIGHT + ARROW_SIZE <= selectionTop - LARGE_GAP
      // i.e.: top <= selectionTop - POPOVER_HEIGHT - ARROW_SIZE - LARGE_GAP
      const LARGE_GAP = 100; // Spacing between the arrow bottom and the selected text when the popover is positioned above
      const idealTopAbove = selectionTop - POPOVER_HEIGHT - ARROW_SIZE - LARGE_GAP;
      const minTop = containerRect.top + 16;
      const maxTop = containerRect.top + containerRect.height - POPOVER_HEIGHT - 16;

      // Calculate the ideal position below: the top of the popup should be below the bottom of the selected text, leaving sufficient space
      // Popup top = top
      // Selected text bottom = selectionBottom
      // Requirement: top >= selectionBottom + GAP
      const idealTopBelow = selectionBottom + GAP + ARROW_SIZE;

      // Check if it can be placed above (without obscuring text or exceeding boundaries)
      // Ensure the bottom of the arrow (top + POPOVER_HEIGHT + ARROW_SIZE) is not higher than the top of the selected text (selectionTop - LARGE_GAP)
      const canPlaceAbove =
        idealTopAbove >= minTop &&
        idealTopAbove <= maxTop &&
        idealTopAbove + POPOVER_HEIGHT + ARROW_SIZE <= selectionTop - LARGE_GAP;

      // Check if it can be placed below (without obscuring text or exceeding boundaries)
      const canPlaceBelow =
        idealTopBelow >= minTop &&
        idealTopBelow <= maxTop &&
        idealTopBelow >= selectionBottom + GAP;

      if (canPlaceAbove) {
        // It can be placed at the top; it is the preferred choice.
        top = idealTopAbove;
        placement = "top";
      } else if (canPlaceBelow) {
        // You can place it below.
        top = idealTopBelow;
        placement = "bottom";
      } else {
        // Neither the upper nor the lower position is ideal; choose the relatively better one.
        if (spaceAbove > spaceBelow) {
          // Try placing it at the top, but ensure it doesn't obscure the text.
          top = Math.max(minTop, Math.min(maxTop, idealTopAbove));
          placement = "top";
          // Force adjustment if it would obscure the text.
          if (top + POPOVER_HEIGHT > selectionTop - GAP) {
            // The top position would be obstructed, so it has been moved to the bottom.
            top = Math.max(minTop, Math.min(maxTop, idealTopBelow));
            placement = "bottom";
            // If the area below is also obstructed, ensure at least the minimum clearance.
            if (top < selectionBottom + GAP) {
              top = selectionBottom + GAP;
            }
          }
        } else {
          // Place it at the bottom.
          top = Math.max(minTop, Math.min(maxTop, idealTopBelow));
          placement = "bottom";
          // Force adjustment if it would obscure the text.
          if (top < selectionBottom + GAP) {
            top = selectionBottom + GAP;
          }
        }
      }

      // Final verification: Ensure the selected text is not obscured.
      if (placement === "top") {
        // For popovers positioned above: Ensure the bottom of the arrow (top + POPOVER_HEIGHT + ARROW_SIZE) is not higher than the top of the selected text (leaving a LARGE_GAP).
        const arrowBottom = top + POPOVER_HEIGHT + ARROW_SIZE;
        if (arrowBottom > selectionTop - LARGE_GAP) {
          // It would obscure the text; changed to the position below.
          top = Math.max(idealTopBelow, selectionBottom + GAP);
          placement = "bottom";
        }
      } else {
        // Popup positioned below: Ensure the top of the popup is not lower than the bottom of the selected text (leaving a gap).
        if (top < selectionBottom + GAP) {
          top = selectionBottom + GAP;
        }
      }

      // Final boundary check: Ensure it does not extend beyond the container (but not at the cost of obscuring text).
      if (top < minTop) {
        // If there is insufficient space above, try below.
        if (placement === "top" && idealTopBelow >= minTop && idealTopBelow <= maxTop) {
          top = idealTopBelow;
          placement = "bottom";
        } else {
          top = minTop;
        }
      }

      if (top + POPOVER_HEIGHT > maxTop + 16) {
        // If there isn't enough space below, try above.
        if (placement === "bottom" && idealTopAbove >= minTop && idealTopAbove <= maxTop) {
          top = idealTopAbove;
          placement = "top";
          // Verify again that the text is not obscured.
          if (top + POPOVER_HEIGHT + ARROW_SIZE > selectionTop - LARGE_GAP) {
            // It will still cause obstruction; keep it at the bottom but adjust its position.
            top = Math.max(minTop, selectionBottom + GAP);
            placement = "bottom";
          }
        } else {
          top = maxTop;
        }
      }

      // Horizontal positioning: Prioritize accurately pointing the arrow at the selected text
      // position.x is the viewport coordinate of the center of the selected text
      const selectionCenterX = position.x;
      const ARROW_MIN_MARGIN = 12; // Minimum distance from the arrow to the edge of the popup

      // Ideally, the popup should be centered relative to the selected text
      // However, if the selected text is near an edge, we need to adjust the popup's position
      // to ensure the arrow can point to the selected text
      let left = selectionCenterX - POPOVER_WIDTH / 2;
      const minLeft = containerRect.left + 16;
      const maxLeft = containerRect.left + containerRect.width - POPOVER_WIDTH - 16;

      // If the popup needs to be repositioned (due to boundary constraints), we need to ensure the arrow still points to the selected text.
      // Calculate the ideal position of the arrow within the popup.
      const idealArrowLeft = selectionCenterX - left;

      // If the ideal arrow position exceeds the limits, adjust the popup position to accommodate the arrow.
      if (idealArrowLeft < ARROW_MIN_MARGIN) {
        // The arrow is too far to the left; adjust the popup to move it to the right.
        left = selectionCenterX - ARROW_MIN_MARGIN;
        if (left < minLeft) {
          left = minLeft;
        }
      } else if (idealArrowLeft > POPOVER_WIDTH - ARROW_MIN_MARGIN) {
        // The arrow is too far to the right; adjust the popup to move it to the left.
        left = selectionCenterX - (POPOVER_WIDTH - ARROW_MIN_MARGIN);
        if (left > maxLeft) {
          left = maxLeft;
        }
      } else {
        // The arrow position is within a reasonable range, but the pop-up may require adjustment due to boundary constraints.
        if (left < minLeft) {
          left = minLeft;
        } else if (left > maxLeft) {
          left = maxLeft;
        }
      }

      // Recalculate the arrow position (based on the adjusted popup position)
      const arrowLeft = selectionCenterX - left;

      // Restrict the arrow's position to ensure it does not extend beyond the popup's boundaries.
      const clampedArrowLeft = Math.max(
        ARROW_MIN_MARGIN,
        Math.min(POPOVER_WIDTH - ARROW_MIN_MARGIN, arrowLeft)
      );

      return {
        top: `${top}px`,
        left: `${left}px`,
        placement,
        arrowLeft: `${clampedArrowLeft}px`,
      };
    }, [visible, position, portalContainer]);

    // Autofocus
    useEffect(() => {
      if (visible && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, [visible]);

    // Reset status
    useEffect(() => {
      if (!visible) {
        setNote("");
      }
    }, [visible]);

    // Keyboard Event Handling
    useEffect(() => {
      if (!visible) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (note.trim()) {
            onConfirm(note.trim());
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [visible, note, onConfirm, onCancel]);

    // Click outside to close
    useEffect(() => {
      if (!visible) return;

      const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
        // Do not close if any element within the popup (including buttons) is clicked
        // Close only when clicking the area outside the popup
        const target = event.target as Node;
        if (popoverRef.current && popoverRef.current.contains(target)) {
          // Do not stop event propagation, allowing the button's onClick to trigger normally.
          return;
        }

        // Clicking outside the area closes the pop-up.
        onCancel();
      };

      // Capture during the capture phase, but do not stop the event propagation at that stage
      // Delay adding the event listener to avoid immediate triggering (giving the user time to click the input box)
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handlePointerOutside, true);
        document.addEventListener("touchstart", handlePointerOutside, true);
      }, 200);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handlePointerOutside, true);
        document.removeEventListener("touchstart", handlePointerOutside, true);
      };
    }, [visible, onCancel]);

    if (!visible || !popoverStyle || !portalContainer) {
      return null;
    }

    const handleConfirm = (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (note.trim()) {
        onConfirm(note.trim());
        setNote("");
      }
    };

    return createPortal(
      <div
        ref={popoverRef}
        className="annotation-popover"
        style={{
          top: popoverStyle.top,
          left: popoverStyle.left,
        }}
        role="dialog"
        aria-label="Add a comment"
        onMouseDown={(e) => {
          // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
          e.stopPropagation();
        }}
      >
        {/* arrow */}
        <div
          className={`annotation-popover-arrow annotation-popover-arrow-${popoverStyle.placement}`}
          style={{
            left: popoverStyle.arrowLeft,
          }}
        />

        {/* content */}
        <div
          className="annotation-popover-content"
          onMouseDown={(e) => {
            // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
            e.stopPropagation();
          }}
          onClick={(e) => {
            // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
            e.stopPropagation();
          }}
        >
          <div className="annotation-popover-header">
            <div className="annotation-popover-title">Add a comment</div>
            <button
              type="button"
              className="annotation-popover-close"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancel();
              }}
              onMouseDown={(e) => {
                // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
                e.stopPropagation();
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div
            className="annotation-popover-selected-text"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {selectedText.length > 60 ? `${selectedText.slice(0, 60)}...` : selectedText}
          </div>

          <div
            className="annotation-popover-body"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <label
              className="annotation-popover-label"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Annotation content
            </label>
            <textarea
              ref={textareaRef}
              className="annotation-popover-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
              }}
              placeholder="Enter your annotation content"
              rows={3}
            />
          </div>

          <div className="annotation-popover-footer">
            <button
              type="button"
              className="annotation-popover-button annotation-popover-button-cancel"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancel();
              }}
              onMouseDown={(e) => {
                // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
                e.stopPropagation();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="annotation-popover-button annotation-popover-button-confirm"
              onClick={handleConfirm}
              onMouseDown={(e) => {
                // Stop event propagation to prevent triggering the logic that closes the element upon an external click.
                e.stopPropagation();
              }}
              disabled={!note.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>,
      portalContainer
    );
  }
);

PopoverEditor.displayName = "PopoverEditor";
