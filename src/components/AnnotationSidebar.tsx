import { AnnotationItem } from "../MarkdownAnnotator";
import { AnnotationCard } from "./AnnotationCard";

interface AnnotationSidebarProps {
  annotations: AnnotationItem[];
  editIndex: number;
  editValue: string;
  onEdit: (index: number, cancel?: boolean) => void;
  onEditChange: (value: string) => void;
  onConfirmEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAnchorToHighlight: (index: number) => void;
}

export function AnnotationSidebar({
  annotations,
  editIndex,
  editValue,
  onEdit,
  onEditChange,
  onConfirmEdit,
  onDelete,
  onAnchorToHighlight,
}: AnnotationSidebarProps) {
  return (
    <div className="markdown-annotator-sidebar">
      <div className="markdown-annotator-sidebar-header">
        <div className="markdown-annotator-sidebar-icon">💡</div>
        <h3 className="markdown-annotator-sidebar-title">Annotations</h3>
      </div>
      {annotations.length === 0 ? (
        <div className="markdown-annotator-empty">
          <div className="markdown-annotator-empty-icon">📝</div>
          <div>No annotations added</div>
          <div style={{ marginTop: "8px", fontSize: "12px" }}>Select text to add comment</div>
        </div>
      ) : (
        annotations.map((annotation, index) => (
          <AnnotationCard
            key={annotation.id}
            index={index}
            annotation={annotation}
            isEditing={editIndex === index}
            editValue={editValue}
            onEdit={onEdit}
            onEditChange={onEditChange}
            onConfirmEdit={onConfirmEdit}
            onDelete={onDelete}
            onAnchorToHighlight={onAnchorToHighlight}
          />
        ))
      )}
    </div>
  );
}
