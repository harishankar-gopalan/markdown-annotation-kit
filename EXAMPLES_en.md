# Usage Examples

This document provides various usage scenarios and example code for `markdown-annotation-kit`.

## Table of Contents

- [Basic Example](#basic-example)
- [Controlled Mode Example](#controlled-mode-example)
- [Loading Saved Annotations](#loading-saved-annotations)
- [Real-time Saving to Server](#real-time-saving-to-server)
- [Custom Styles](#custom-styles)
- [Integration with State Management Libraries](#integration-with-state-management-libraries)
- [Form Integration](#form-integration)

## Basic Example

The simplest usage, with state managed internally by the component.

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function BasicExample() {
  const markdown = `# Document Title

This is some text content that can be annotated.

## Features

- Supports text selection
- Supports annotation creation
- Supports bidirectional anchoring`;

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## Controlled Mode Example

Using controlled mode to fully manage component state externally.

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function ControlledExample() {
  const [markdown, setMarkdown] = useState(`# Document Title

This is some text content that can be annotated.`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />
    </div>
  );
}
```

## Loading Saved Annotations

Loading previously saved annotation data from a server or local storage.

```tsx
import { useEffect, useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function LoadSavedExample() {
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from a server
    const loadData = async () => {
      try {
        const response = await fetch('/api/document/123');
        const data = await response.json();
        
        setMarkdown(data.markdown); // Markdown containing <mark_N> tags
        setAnnotations(data.annotations); // Annotation list
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        defaultAnnotations={annotations}
      />
    </div>
  );
}
```

## Real-time Saving to Server

Automatically saves to the server whenever annotations change. It is recommended to use the `onPersistence` prop, which has debouncing built in.

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function AutoSaveExample() {
  const [markdown, setMarkdown] = useState(`# Document Title

This is some text content that can be annotated.`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [saving, setSaving] = useState(false);

  const handlePersistence = async (data) => {
    setSaving(true);
    try {
      await fetch('/api/document/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: data.markdown,
          annotations: data.annotations,
          marks: data.marks,
          cleanMarkdown: data.cleanMarkdown,
        }),
      });
      console.log('Saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {saving && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10000
        }}>
          Saving...
        </div>
      )}
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
        onPersistence={handlePersistence}
        persistenceDebounce={1000}
      />
    </div>
  );
}
```

**Note**: `onPersistence` fires automatically when annotations are added, edited, or deleted, and debouncing is built in. You only need to provide a callback function — there is no need to implement debounce logic manually.

## Custom Styles

Customizing component styles via `className` and CSS.

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import './CustomStyles.css';

function CustomStyleExample() {
  const markdown = `# Document Title

This is some text content that can be annotated.`;

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        className="custom-annotator"
      />
    </div>
  );
}
```

**CustomStyles.css:**

```css
.custom-annotator {
  /* Custom root container styles */
  background-color: #f5f5f5;
}

.custom-annotator .annotation-highlight {
  /* Custom highlighted text styles */
  background-color: rgba(255, 235, 59, 0.3) !important;
  text-decoration: underline;
  text-decoration-color: #ff9800;
}

/* Custom sidebar styles */
.custom-annotator > div:last-child {
  background-color: #ffffff;
  border-left: 2px solid #2563eb;
}
```

## Integration with State Management Libraries

### Redux Integration

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import { updateMarkdown, updateAnnotations } from './store/documentSlice';

function ReduxExample() {
  const dispatch = useDispatch();
  const markdown = useSelector((state: any) => state.document.markdown);
  const annotations = useSelector((state: any) => state.document.annotations);

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={(newMarkdown) => dispatch(updateMarkdown(newMarkdown))}
        annotations={annotations}
        onAnnotationsChange={(newAnnotations) => 
          dispatch(updateAnnotations(newAnnotations))
        }
      />
    </div>
  );
}
```

### Zustand Integration

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import { useDocumentStore } from './store/documentStore';

function ZustandExample() {
  const { markdown, annotations, setMarkdown, setAnnotations } = useDocumentStore();

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />
    </div>
  );
}
```

## Form Integration

Integrating the component into a form to be submitted alongside other fields.

```tsx
import { useState, FormEvent } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function FormExample() {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title,
      markdown,
      annotations,
    };

    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Submitted successfully!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <label>
          Document title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginLeft: '10px', padding: '8px', width: '300px' }}
          />
        </label>
      </div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
        />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit document
        </button>
      </div>
    </form>
  );
}
```

## Read-only Mode

Implementing read-only mode by disabling interactions (requires custom implementation).

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function ReadOnlyExample() {
  const markdown = `# Document Title

This is <mark_1>a piece of already-marked text</mark_1>.`;

  const annotations = [
    { id: 1, note: 'This is the first annotation' }
  ];

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        defaultAnnotations={annotations}
        className="read-only-annotator"
      />
    </div>
  );
}
```

**Read-only CSS:**

```css
.read-only-annotator {
  pointer-events: none; /* Disable all interactions */
}

.read-only-annotator .annotation-highlight {
  cursor: default; /* Remove pointer cursor */
}
```

## Internationalization Support

Combining with an i18n library for multi-language support.

```tsx
import { useTranslation } from 'react-i18next';
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function I18nExample() {
  const { t } = useTranslation();

  const markdown = t('document.content');

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## Error Handling

Adding an error boundary and error handling logic.

```tsx
import { Component, ReactNode } from 'react';
import { MarkdownAnnotator } from 'markdown-annotation-kit';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page and try again.</div>;
    }

    return this.props.children;
  }
}

function ErrorHandlingExample() {
  const markdown = `# Document Title

This is some text content that can be annotated.`;

  return (
    <ErrorBoundary>
      <div style={{ height: '100vh' }}>
        <MarkdownAnnotator defaultValue={markdown} />
      </div>
    </ErrorBoundary>
  );
}
```

## Performance Optimization

For large documents, use `React.memo` and `useMemo` to optimize performance.

```tsx
import { memo, useMemo } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

const OptimizedAnnotator = memo(({ markdown, annotations }: {
  markdown: string;
  annotations: AnnotationItem[];
}) => {
  // Use useMemo to cache processed data
  const processedMarkdown = useMemo(() => {
    // Perform any pre-processing logic here
    return markdown;
  }, [markdown]);

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={processedMarkdown}
        annotations={annotations}
      />
    </div>
  );
});

function PerformanceExample() {
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <OptimizedAnnotator
      markdown={markdown}
      annotations={annotations}
    />
  );
}
```

## Complete Application Example

A complete example of a document editing application.

```tsx
import { useState, useEffect } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function DocumentEditor() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
      const id = new URLSearchParams(window.location.search).get('id');
      if (!id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/documents/${id}`);
        const data = await response.json();
        
        setDocumentId(id);
        setMarkdown(data.markdown);
        setAnnotations(data.annotations || []);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, []);

  // Auto-save
  useEffect(() => {
    if (!documentId) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown, annotations }),
        });
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [markdown, annotations, documentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {saving && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10000
        }}>
          Saved
        </div>
      )}
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />
    </div>
  );
}

export default DocumentEditor;
```

## Further Examples

For more usage scenarios and example code, refer to:

- [README.md](./README.md) — Project introduction and quick start
- [API.md](./API_en.md) — Complete API documentation