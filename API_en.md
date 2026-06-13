# API Documentation

This document details all APIs for `markdown-annotation-kit`.

## Exports

### MarkdownAnnotator

The primary annotation component.

```typescript
import { MarkdownAnnotator } from 'markdown-annotation-kit';
```

### Type Exports

```typescript
import type { 
  MarkdownAnnotatorProps, 
  AnnotationItem 
} from 'markdown-annotation-kit';
```

## Component API

### MarkdownAnnotator

#### Props

##### `defaultValue?: string`

Default Markdown content in uncontrolled mode.

- **Type**: `string`
- **Default**: `""`
- **Description**: When `value` is not provided, the component uses this as its initial content. Supports Markdown strings containing `<mark_N></mark_N>` tags.

**Example:**
```tsx
<MarkdownAnnotator 
  defaultValue="# Title\n\nThis is <mark_1>some text</mark_1>." 
/>
```

---

##### `value?: string`

Markdown content in controlled mode.

- **Type**: `string`
- **Description**: When this prop is provided, the component enters controlled mode. Must be used together with `onChange`.

**Example:**
```tsx
const [markdown, setMarkdown] = useState('# Title');

<MarkdownAnnotator 
  value={markdown}
  onChange={setMarkdown}
/>
```

---

##### `onChange?: (markdown: string) => void`

Callback fired when the Markdown content changes.

- **Type**: `(markdown: string) => void`
- **Parameters**:
  - `markdown: string` — The updated Markdown content, including `<mark_N></mark_N>` tags
- **Description**: Used only in controlled mode. Fires when the user adds or removes annotations.

**Example:**
```tsx
const handleChange = (newMarkdown: string) => {
  console.log('Markdown updated:', newMarkdown);
  // Save to server
  saveToServer(newMarkdown);
};

<MarkdownAnnotator 
  value={markdown}
  onChange={handleChange}
/>
```

---

##### `defaultAnnotations?: AnnotationItem[]`

Default annotation list in uncontrolled mode.

- **Type**: `AnnotationItem[]`
- **Default**: `[]`
- **Description**: When `annotations` is not provided, the component uses this as its initial annotation list.

**Example:**
```tsx
const initialAnnotations = [
  { id: 1, note: 'This is the first annotation' },
  { id: 2, note: 'This is the second annotation' }
];

<MarkdownAnnotator 
  defaultAnnotations={initialAnnotations}
/>
```

---

##### `annotations?: AnnotationItem[]`

Annotation list in controlled mode.

- **Type**: `AnnotationItem[]`
- **Description**: When this prop is provided, the component enters controlled mode. Must be used together with `onAnnotationsChange`.

**Example:**
```tsx
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator 
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

---

##### `onAnnotationsChange?: (annotations: AnnotationItem[]) => void`

Callback fired when the annotation list changes.

- **Type**: `(annotations: AnnotationItem[]) => void`
- **Parameters**:
  - `annotations: AnnotationItem[]` — The updated annotation list
- **Description**: Used only in controlled mode. Fires when the user adds, edits, or deletes annotations.

**Example:**
```tsx
const handleAnnotationsChange = (newAnnotations: AnnotationItem[]) => {
  console.log('Annotations updated:', newAnnotations);
  // Save to server
  saveToServer({ annotations: newAnnotations });
};

<MarkdownAnnotator 
  annotations={annotations}
  onAnnotationsChange={handleAnnotationsChange}
/>
```

---

##### `onPersistence?: (data: {...}) => void | Promise<void>`

Persistence callback function.

- **Type**: `(data: { markdown: string; annotations: AnnotationItem[]; marks: ParsedMark[]; cleanMarkdown: string }) => void | Promise<void>`
- **Parameters**:
  - `data.markdown: string` — Raw Markdown content containing `<mark_N></mark_N>` tags
  - `data.annotations: AnnotationItem[]` — The annotation list
  - `data.marks: ParsedMark[]` — Parsed mark position information
  - `data.cleanMarkdown: string` — Cleaned Markdown content (without tags)
- **Description**: Fires when annotation data changes, with debounce support. The callback may return `Promise<void>` to support async operations.

**Example:**
```tsx
const handlePersistence = async (data) => {
  // Save to server
  await saveToServer({
    markdown: data.markdown,
    annotations: data.annotations,
    marks: data.marks,
    cleanMarkdown: data.cleanMarkdown,
  });
};

<MarkdownAnnotator
  value={markdown}
  annotations={annotations}
  onPersistence={handlePersistence}
  persistenceDebounce={500}
/>
```

---

##### `persistenceDebounce?: number`

Debounce delay for the persistence callback (in milliseconds).

- **Type**: `number`
- **Default**: `500`
- **Description**: Controls the debounce delay for the `onPersistence` callback. Set to `0` to disable debouncing.

---

##### `className?: string`

Custom CSS class name.

- **Type**: `string`
- **Description**: A class name added to the component's root element, which can be used for custom styling.

**Example:**
```tsx
<MarkdownAnnotator 
  className="my-custom-class"
/>
```

---

## Type Definitions

### AnnotationItem

Data structure for an annotation item.

```typescript
type AnnotationItem = {
  id: number;      // Annotation ID, must be unique, typically a positive integer
  note: string;    // Annotation text content
};
```

**Property descriptions:**

- `id: number` — The unique identifier for the annotation. The component auto-generates incrementing IDs, but you may also specify them manually. The ID must correspond to the `N` in the `<mark_N></mark_N>` tags in the Markdown.
- `note: string` — The text content of the annotation.

**Example:**
```typescript
const annotation: AnnotationItem = {
  id: 1,
  note: 'This is an important note'
};
```

---

### MarkdownAnnotatorProps

The complete Props type definition for the component.

```typescript
type MarkdownAnnotatorProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  defaultAnnotations?: AnnotationItem[];
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (annotations: AnnotationItem[]) => void;
  onPersistence?: (data: {
    markdown: string;
    annotations: AnnotationItem[];
    marks: ParsedMark[];
    cleanMarkdown: string;
  }) => void | Promise<void>;
  persistenceDebounce?: number;
  className?: string;
};
```

---

## Usage Patterns

### Uncontrolled Mode

Use `defaultValue` and `defaultAnnotations`; the component manages state internally.

```tsx
<MarkdownAnnotator
  defaultValue="# Title\n\nThis is some content."
  defaultAnnotations={[]}
/>
```

**Suitable for:**
- Simple display scenarios
- Cases where real-time data saving is not required
- One-time data retrieval on form submission

---

### Controlled Mode

Use `value`, `onChange`, `annotations`, and `onAnnotationsChange`; state is managed externally.

```tsx
const [markdown, setMarkdown] = useState('# Title\n\nThis is some content.');
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

**Suitable for:**
- Real-time saving to a server
- Syncing state with other components
- Implementing undo/redo functionality
- Validating or transforming data

---

### Hybrid Mode

You can use controlled mode for only the Markdown or only the annotation list.

**Control only Markdown:**
```tsx
const [markdown, setMarkdown] = useState('# Title');

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  defaultAnnotations={[]}
/>
```

**Control only the annotation list:**
```tsx
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  defaultValue="# Title"
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

---

## Tag Format

The component uses `<mark_N></mark_N>` tags to mark annotated text.

### Tag Rules

1. **Format**: `<mark_N>text</mark_N>`, where `N` is the annotation ID
2. **ID requirements**: Must be a positive integer and unique
3. **Nesting**: Tags cannot be nested, but they can be adjacent
4. **Position**: Tags can appear anywhere within the Markdown

### Examples

**Single annotation:**
```markdown
This is <mark_1>a piece of marked text</mark_1> within the content.
```

**Multiple annotations:**
```markdown
This is <mark_1>the first</mark_1> annotation, and this is <mark_2>the second</mark_2> annotation.
```

**Adjacent annotations:**
```markdown
This is <mark_1>the first part</mark_1><mark_2>the second part</mark_2> annotation.
```

---

## Interaction Behavior

### Adding an Annotation

1. The user selects text in the Markdown rendered area
2. After selection, a floating popup appears above the selection
3. The user enters the annotation content in the popup
4. After clicking "Confirm":
   - The component automatically generates a new annotation ID
   - A `<mark_N></mark_N>` tag is inserted into the Markdown
   - The marked text in the original content is highlighted with an underline
   - A new annotation card appears in the sidebar

### Editing an Annotation

1. Click the "Edit" button on an annotation card
2. The annotation card enters edit mode, displaying a text input field
3. After modifying the annotation content, click "Confirm"
4. The annotation content is updated; the tags in the Markdown remain unchanged

### Deleting an Annotation

1. Click the "Delete" button on an annotation card
2. The component automatically removes the corresponding `<mark_N></mark_N>` tags from the Markdown
3. The annotation card is removed from the sidebar
4. The highlight effect on the original text disappears

### Bidirectional Anchoring

**From source text to annotation:**
- Click on highlighted text in the source
- The sidebar automatically scrolls to the corresponding annotation card
- The annotation card briefly highlights

**From annotation to source text:**
- Click on an annotation card in the sidebar
- The source text automatically scrolls to the corresponding position
- The highlighted text briefly flashes as an indicator

---

## Notes

### ID Management

- The component auto-generates incrementing annotation IDs
- New annotation ID = max(existing annotation IDs, existing tag IDs) + 1
- If specifying IDs manually, ensure they are unique

### Data Synchronization

- In controlled mode, `value` and `annotations` must remain in sync
- The tag IDs in the Markdown must correspond to the IDs in the annotation list
- When an annotation is deleted, the component automatically removes the corresponding tag from the Markdown

### Performance Considerations

- The component uses `useMemo` to cache parsed results
- For a large number of annotations, virtual scrolling is recommended (must be implemented separately)
- Long documents are recommended to be loaded in pages

### Browser Compatibility

- Requires ES6+ support
- Requires `getSelection` API support
- Requires `scrollIntoView` API support

---

## Example Code

### Complete Example

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function App() {
  const [markdown, setMarkdown] = useState(`# Document Title

This is some text content that can be annotated.`);
  
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handleMarkdownChange = async (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    // Save to server
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ markdown: newMarkdown })
    });
  };

  const handleAnnotationsChange = async (newAnnotations: AnnotationItem[]) => {
    setAnnotations(newAnnotations);
    // Save to server
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ annotations: newAnnotations })
    });
  };

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={handleMarkdownChange}
      annotations={annotations}
      onAnnotationsChange={handleAnnotationsChange}
      className="my-annotator"
    />
  );
}
```

---

## Frequently Asked Questions

### Q: How do I customize styles?

A: Use the `className` prop to add a custom class name, then override the default styles with CSS. The component uses inline styles, which can be overridden using `!important` or higher CSS specificity.

### Q: How is annotation data persisted?

A: It is recommended to use controlled mode and save data to the server in the `onChange` and `onAnnotationsChange` callbacks.

### Q: How do I handle tag parsing errors?

A: The component automatically handles malformed tags. If issues arise, you can first validate the tag format using the `stripMarkTags` function (used internally).

### Q: What Markdown features are supported?

A: The component is based on `react-markdown` and supports all standard Markdown syntax, as well as the GFM (GitHub Flavored Markdown) extension.

### Q: Can I customize annotation IDs?

A: Yes, but you must ensure IDs are unique and correspond to the tag IDs in the Markdown. It is recommended to let the component auto-generate IDs.