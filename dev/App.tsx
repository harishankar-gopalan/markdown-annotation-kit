import { useState, useMemo, useCallback } from 'react';
import { MarkdownAnnotator, AnnotationItem, exportAnnotationData, ParsedMark } from '../src/index';
import './App.css';

const DEFAULT_MARKDOWN = `# Markdown Document Annotation Example

## Features

This is a powerful Markdown <mark_2>annotation</mark_2> component that supports the following features:

- **Text Selection Annotation** - Select any text to add an annotation
- **Bidirectional Anchoring** - Click an annotation card to locate the original text; click highlighted text to locate the annotation
- **Tagging System** - Use \`<mark_N></mark_N>\` tags to persist <mark_3>annotation</mark_3> data
- **Tag Rendering** - Automatically recognize and render saved annotation tags

> This component adds annotation functionality to Markdown documents.

> You can select any text, enter the annotation content in the pop-up window, and click confirm.

> You can click an annotation card to locate the original text, or click highlighted text to locate the annotation.

> You can use \`<mark_N></mark_N>\` tags to persist annotation data.

> Saved annotation tags are automatically recognized and rendered.

> You can use \`<mark_N></mark_N>\` tags to persist annotation data.

## Usage Instructions

1. **Add Annotation**: Select any text, enter the annotation content in the pop-up window, and click confirm.

2. **View Annotations**: The sidebar displays all annotation cards; click a card to navigate to its location in the original text.

3. **Edit Annotation**: Click the "Edit" button on an annotation card to modify the content.

4. **Delete Annotation**: Click the "Delete" button on an annotation card to remove the annotation.

<mark_1>This text already contains an example annotation tag</mark_1>; you can see that it is highlighted. ## Code Example

\`\`\`typescript
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  return (
    <MarkdownAnnotator
      defaultValue="# Title\n\nThis is the content."
    />
  );
}
\`\`\`

## More Information

Check the [README.md](../README.md) for more usage details and API documentation.
`;

const DEFAULT_ANNOTATIONS: AnnotationItem[] = [
  {
    id: 1,
    note: 'This is a sample annotation demonstrating the tag echo feature. You can edit or delete this annotation.',
  },
  {
    id: 2,
    note: 'Annotation 2',
  },
  {
    id: 3,
    note: 'Annotation 3',
  },
];

type PreviewTab = 'markdown' | 'annotations' | 'both';

function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(DEFAULT_ANNOTATIONS);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('both');
  const [marks, setMarks] = useState<ParsedMark[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const markdownPreview = useMemo(() => {
    return markdown;
  }, [markdown]);

  const annotationsJson = useMemo(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  // Persistence callback - save to localStorage
  const handlePersistence = useCallback(
    (data: {
      markdown: string;
      annotations: AnnotationItem[];
      marks: ParsedMark[];
      cleanMarkdown: string;
    }) => {
      try {
        // Save to localStorage
        const storageKey = 'markdown-annotation-kit-data';
        const dataToSave = exportAnnotationData(data.markdown, data.annotations, data.marks, data.cleanMarkdown);
        localStorage.setItem(storageKey, dataToSave);
        setLastSaved(new Date());
        setMarks(data.marks);
        console.log('✅ Annotation data has been automatically saved to localStorage.');
      } catch (error) {
        console.error('❌ Failed to save annotation data:', error);
      }
    },
    []
  );

  // Manual save button
  const handleManualSave = useCallback(() => {
    try {
      const dataToSave = exportAnnotationData(markdown, annotations, marks, markdown.replace(/<mark_\d+>|<\/mark_\d+>/g, ''));
      
      // Save to localStorage
      localStorage.setItem('markdown-annotation-kit-data', dataToSave);
      
      // Also provides download functionality
      const blob = new Blob([dataToSave], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markdown-annotations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastSaved(new Date());
      console.log('✅ Annotation data has been saved and downloaded.');
    } catch (error) {
      console.error('❌ Failed to save annotation data.:', error);
      alert('Save failed; please check the console.');
    }
  }, [markdown, annotations, marks]);

  // Load saved data
  const handleLoadSaved = useCallback(() => {
    try {
      const storageKey = 'markdown-annotation-kit-data';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.markdown) setMarkdown(data.markdown);
        if (data.annotations) setAnnotations(data.annotations);
        if (data.marks) setMarks(data.marks);
        console.log('✅ Saved annotation data has been loaded.');
        alert('Saved annotation data has been loaded.');
      } else {
        alert('No saved data found.');
      }
    } catch (error) {
      console.error('❌ Failed to load annotation data.:', error);
      alert('Failed to load; please check the console.');
    }
  }, []);

  return (
    <div className="dev-app">
      {/* 头部信息 */}
      <header className="dev-app-header">
        <div className="dev-app-header-content">
          <div>
            <h1 className="dev-app-title">
              <span className="dev-app-icon">📝</span>
              Markdown Annotation Kit
            </h1>
            <p className="dev-app-subtitle">
              Development Preview – Select text to add annotations and view real-time results.
            </p>
          </div>
          <div className="dev-app-stats">
            <div className="dev-app-stat">
              <span className="dev-app-stat-label">Annotation count</span>
              <span className="dev-app-stat-value">{annotations.length}</span>
            </div>
            {lastSaved && (
              <div className="dev-app-stat" style={{ opacity: 0.8 }}>
                <span className="dev-app-stat-label">Save at the end</span>
                <span className="dev-app-stat-value" style={{ fontSize: '12px' }}>
                  {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleManualSave}
                className="dev-app-save-button"
                title="Save annotation data locally and download the JSON file."
              >
                💾 Save
              </button>
              <button
                onClick={handleLoadSaved}
                className="dev-app-save-button"
                title="Load saved annotation data from localStorage"
              >
                📂 Load
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dev-app-main">
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
          onPersistence={handlePersistence}
          persistenceDebounce={500}
        />
      </div>

      {/* Bottom Data Preview - Collapsible */}
      <div className={`dev-app-preview ${previewVisible ? 'dev-app-preview-visible' : ''}`}>
        <div className="dev-app-preview-header">
          <div className="dev-app-preview-tabs">
            <button
              className={`dev-app-preview-tab ${previewTab === 'markdown' ? 'active' : ''}`}
              onClick={() => setPreviewTab('markdown')}
            >
              Markdown
            </button>
            <button
              className={`dev-app-preview-tab ${previewTab === 'annotations' ? 'active' : ''}`}
              onClick={() => setPreviewTab('annotations')}
            >
              Annotation data
            </button>
            <button
              className={`dev-app-preview-tab ${previewTab === 'both' ? 'active' : ''}`}
              onClick={() => setPreviewTab('both')}
            >
              All
            </button>
          </div>
          <button
            className="dev-app-preview-toggle"
            onClick={() => setPreviewVisible(!previewVisible)}
            aria-label={previewVisible ? 'Collapse' : 'Expand'}
          >
            {previewVisible ? '▼' : '▲'}
          </button>
        </div>
        {previewVisible && (
          <div className="dev-app-preview-content">
            {(previewTab === 'markdown' || previewTab === 'both') && (
              <div className="dev-app-preview-panel">
                <div className="dev-app-preview-panel-header">
                  <span className="dev-app-preview-panel-icon">📄</span>
                  <span className="dev-app-preview-panel-title">Current Markdown (including tags) </span>
                  <span className="dev-app-preview-panel-badge">
                    {markdown.length} characters
                  </span>
                </div>
                <textarea
                  readOnly
                  value={markdownPreview}
                  className="dev-app-preview-textarea"
                  spellCheck={false}
                />
              </div>
            )}
            {(previewTab === 'annotations' || previewTab === 'both') && (
              <div className="dev-app-preview-panel">
                <div className="dev-app-preview-panel-header">
                  <span className="dev-app-preview-panel-icon">💬</span>
                  <span className="dev-app-preview-panel-title">Annotation data（JSON）</span>
                  <span className="dev-app-preview-panel-badge">
                    {annotations.length} words
                  </span>
                </div>
                <pre className="dev-app-preview-code">
                  {annotationsJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

