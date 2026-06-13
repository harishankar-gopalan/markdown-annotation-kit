import { AnnotationItem } from "../MarkdownAnnotator";

interface AnnotationCardProps {
  index: number;
  annotation: AnnotationItem;
  isEditing: boolean;
  editValue: string;
  onEdit: (index: number, cancel?: boolean) => void;
  onEditChange: (value: string) => void;
  onConfirmEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAnchorToHighlight: (index: number) => void;
}

export function AnnotationCard({
  index,
  annotation,
  isEditing,
  editValue,
  onEdit,
  onEditChange,
  onConfirmEdit,
  onDelete,
  onAnchorToHighlight,
}: AnnotationCardProps) {
  return (
    <div
      id={`annotation-card-${index}`}
      className="annotation-card"
      onClick={() => onAnchorToHighlight(index)}
    >
      <div className="annotation-card-header">
        <div className="annotation-card-badge">
          <span className="annotation-card-number">{index + 1}</span>
          <span className="annotation-card-label">Annotation {index + 1}</span>
        </div>
        <div className="annotation-card-actions">
          <button
            className="annotation-card-button annotation-card-button-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
          >
            Edit
          </button>
          <button
            className="annotation-card-button annotation-card-button-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="annotation-card-edit-area">
          <textarea
            className="annotation-card-textarea"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="annotation-card-edit-actions">
            <button
              className="annotation-card-button-cancel"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(index, true);
              }}
            >
              Cancel
            </button>
            <button
              className="annotation-card-button-confirm"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmEdit(index);
              }}
              disabled={!editValue.trim()}
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <p className="annotation-card-content">{annotation.note}</p>
      )}
    </div>
  );
}
