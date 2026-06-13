# Markdown Document Annotation Component - Interaction Logic Guide

## 📋 Overview

`markdown-annotation-kit` is a fully-featured React component library for adding annotation functionality to Markdown documents. It supports core features including text selection, annotation creation, tag echo rendering, and bidirectional anchoring.

## 🎯 Core Features

### 1. Text Selection and Annotation Creation

#### Interaction Flow

1. **Text Selection**
   - The user selects any text within the Markdown rendered area
   - Supports multiple selection methods including mouse drag and keyboard selection
   - Once selection is complete, the system automatically captures the selection information

2. **Popup Display**
   - After selecting text, an interactive popup automatically appears above the selection
   - The popup position adjusts intelligently:
     - Displays above the selection by default
     - Automatically switches to below if there is insufficient space above
     - Centered horizontally, ensuring it stays within the viewport boundaries

3. **Annotation Input**
   - The popup contains:
     - A preview of the selected text (up to 96 characters)
     - An annotation content input field (multi-line text)
     - "Cancel" and "Confirm" buttons
   - Keyboard operations supported:
     - `ESC` key closes the popup
     - The input field receives focus automatically

4. **Annotation Confirmation**
   - After clicking the "Confirm" button:
     - The system automatically generates an annotation ID (existing max ID + 1)
     - A `<mark_N></mark_N>` tag is inserted into the source data to wrap the selected text
     - The marked text in the original content is highlighted with an underline
     - An annotation card appears in the sidebar
     - The popup closes automatically

#### Example

**Initial Markdown:**
```markdown
# Document Title

This is some text content that can be annotated.
```

**The user selects "text content that can be annotated" and enters the annotation "This section needs further explanation"**

**Markdown after confirmation:**
```markdown
# Document Title

This is some <mark_1>text content that can be annotated</mark_1>.
```

**Visual result:**
- "text content that can be annotated" is displayed with underline highlighting in the source
- An annotation card appears in the sidebar showing the annotation content

---

### 2. Tag System and Data Persistence

#### Tag Format

- **Tag format**: `<mark_N></mark_N>`
  - `N` is the annotation ID (positive integer, starting from 1)
  - Tags must appear in pairs
  - IDs must be unique

#### Tag Insertion Rules

1. **Position Calculation**
   - The system maintains a `boundaryMap` that maps cleaned text indices to original indices
   - Based on the user's selected text position (relative to the cleaned Markdown), the exact insertion position in the original data is calculated precisely

2. **ID Generation**
   - Auto-incrementing: new annotation ID = existing max ID + 1
   - Uniqueness of IDs is guaranteed

3. **Tag Nesting Handling**
   - Multiple annotation tags are supported
   - Tags can be adjacent, but cannot be nested

#### Example

**Multiple annotations:**
```markdown
This is <mark_1>the first</mark_1> annotation, and this is <mark_2>the second</mark_2> annotation.
```

**Adjacent annotations:**
```markdown
This is <mark_1>the first part</mark_1><mark_2>the second part</mark_2> annotation.
```

---

### 3. Tag Echo Rendering

#### How It Works

1. **Data Parsing**
   - The component receives Markdown data containing `<mark_N>` tags
   - The `stripMarkTags` function parses the tags:
     - Extracts all `<mark_N></mark_N>` tags
     - Records the ID and position range of each tag
     - Generates cleaned Markdown (with tags removed)
     - Generates a boundary map (for subsequent insertion of new tags)

2. **Annotation Matching**
   - The component receives an `annotations` array of annotation data
   - Each annotation item contains an `id` and a `note`
   - The system matches corresponding annotation content based on the IDs in the tags

3. **Visual Echo**
   - Text wrapped by tags in the original content is automatically highlighted with an underline
   - Corresponding annotation cards are automatically displayed in the sidebar

#### Example

**Source data with tags:**
```markdown
# Example Document

<mark_1>This text has already been marked</mark_1> and will be echoed automatically.

<mark_2>Another piece of marked text</mark_2>.
```

**Annotation data:**
```json
[
  { "id": 1, "note": "This is the first annotation" },
  { "id": 2, "note": "This is the second annotation" }
]
```

**Result:**
- "This text has already been marked" is underline-highlighted, and annotation #1 is shown in the sidebar
- "Another piece of marked text" is underline-highlighted, and annotation #2 is shown in the sidebar

---

### 4. Bidirectional Anchoring

#### Feature Description

Bidirectional anchoring allows users to quickly jump between annotation cards and highlighted text in the source:

1. **From source text to annotation card**
   - Click on highlighted text in the source
   - The system automatically scrolls to the corresponding annotation card
   - The annotation card is highlighted (flashing animation)
   - The source highlight also flashes in sync

2. **From annotation card to source text**
   - Click on an annotation card in the sidebar
   - The system automatically scrolls to the corresponding position in the source text
   - If the source text is not in view, it smoothly scrolls to the center of the viewport
   - The source highlight flashes as an indicator
   - The annotation card also flashes in sync

3. **Smart Scrolling**
   - Checks whether the target element is within the viewport
   - If not, uses `scrollIntoView` to scroll
   - Uses smooth scroll animation (`behavior: "smooth"`)

#### Example Scenarios

**Scenario 1: Browsing a long document**
```
The user is reading a long document and sees an annotation card at line 50.
After clicking the card, the page automatically scrolls to the corresponding source text at line 200.
```

**Scenario 2: Quick navigation**
```
While reading the source text, the user spots highlighted text.
Clicking the highlighted text causes the sidebar to automatically scroll to the corresponding annotation card.
```

---

### 5. Annotation Flag Markers

#### Feature Description

Flag markers are displayed beside text segments that have annotations, showing the number of annotations within that segment.

1. **Flag Display**
   - A circular badge showing the annotation count
   - Position: to the right of the text segment
   - Style: small circle with a border and background color

2. **Annotation List**
   - Clicking a flag displays a list of all annotations for that segment
   - The list appears in a popup
   - Shows the ID, content, and excerpt for each annotation

3. **Quick Navigation**
   - Clicking an annotation item in the list automatically navigates to and highlights the corresponding source text

#### Example

**Multiple annotations on the same text segment:**
```markdown
This is <mark_1>the first part</mark_1> annotation, <mark_2>the second part</mark_2> is on the same line.
```

**Result:**
- A flag is displayed to the right of that line of text, showing the number "2"
- Clicking the flag opens a popup list showing two annotations
- Clicking any annotation in the list navigates to the corresponding source text position

---

## 📝 Typical Use Case Examples

### Example 1: Document Review

**Scenario:**
A team collaboratively reviews a technical document and needs to add revision suggestions.

**Initial document:**
```markdown
# API Design Document

## User Authentication

The user login endpoint requires a username and password.
```

**Workflow:**
1. Select "username and password"
2. Enter annotation: "Consider using OAuth 2.0 authentication"
3. After confirming, the document becomes:
   ```markdown
   # API Design Document
   
   ## User Authentication
   
   The user login endpoint requires a <mark_1>username and password</mark_1>.
   ```
4. The annotation card is shown in the sidebar
5. Other team members can click the annotation to view the suggestion

---

### Example 2: Study Notes

**Scenario:**
While learning Markdown syntax, the user adds annotations to key content.

**Initial document:**
```markdown
# Markdown Syntax

## Emphasis

**Bold text** is wrapped with two asterisks.
*Italic text* is wrapped with one asterisk.
```

**Workflow:**
1. Select "wrapped with two asterisks"
2. Enter annotation: "You can also use two underscores __bold__"
3. Select "wrapped with one asterisk"
4. Enter annotation: "You can also use one underscore _italic_"
5. Final document:
   ```markdown
   # Markdown Syntax
   
   ## Emphasis
   
   **Bold text** is <mark_1>wrapped with two asterisks</mark_1>.
   *Italic text* is <mark_2>wrapped with one asterisk</mark_2>.
   ```

---

### Example 3: Code Review

**Scenario:**
During a code review, the user adds questions and suggestions to the design descriptions in the document.

**Initial document:**
```markdown
# System Architecture Design

## Database Design

The system uses MySQL as the primary database and Redis as the caching layer.
```

**Workflow:**
1. Select "MySQL"
2. Enter annotation: "Consider using PostgreSQL for better JSON query support"
3. Select "Redis"
4. Enter annotation: "Recommend evaluating Memcached performance"
5. Final document:
   ```markdown
   # System Architecture Design
   
   ## Database Design
   
   The system uses <mark_1>MySQL</mark_1> as the primary database and <mark_2>Redis</mark_2> as the caching layer.
   ```

---

### Example 4: Loading Saved Annotations from a Server

**Scenario:**
Loading a document with annotation tags from the server, with automatic echo rendering of annotations.

**Data returned from the server:**
```markdown
# Project Plan

## Phase 1

<mark_1>Requirements analysis</mark_1> requires 2 weeks.
<mark_2>Prototype design</mark_2> requires 1 week.
```

**Annotation data:**
```json
[
  { "id": 1, "note": "Need to confirm detailed requirements with the product manager" },
  { "id": 2, "note": "Use Figma for design" }
]
```

**Component usage:**
```tsx
<MarkdownAnnotator
  defaultValue={markdownFromServer}
  defaultAnnotations={annotationsFromServer}
/>
```

**Result:**
- "Requirements analysis" and "Prototype design" are automatically highlighted
- The corresponding annotation cards are automatically displayed in the sidebar
- The user can continue adding new annotations

---

### Example 5: Controlled Mode — Real-time Sync to Server

**Scenario:**
Annotations need to be saved to the server in real time.

**Component usage:**
```tsx
const [markdown, setMarkdown] = useState(initialMarkdown);
const [annotations, setAnnotations] = useState([]);

const handleMarkdownChange = async (newMarkdown) => {
  setMarkdown(newMarkdown);
  await saveToServer({ markdown: newMarkdown });
};

const handleAnnotationsChange = async (newAnnotations) => {
  setAnnotations(newAnnotations);
  await saveToServer({ annotations: newAnnotations });
};

<MarkdownAnnotator
  value={markdown}
  onChange={handleMarkdownChange}
  annotations={annotations}
  onAnnotationsChange={handleAnnotationsChange}
/>
```

**Workflow:**
1. The user creates an annotation
2. `onChange` and `onAnnotationsChange` fire immediately
3. Data is automatically saved to the server
4. Undo/redo is supported (implemented via state management)

---

## 🔄 Complete Interaction Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   User selects text                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Popup appears (shows selected text preview)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           User enters annotation content                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               User clicks "Confirm"                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│   1. Generate annotation ID (N)                         │
│   2. Insert <mark_N></mark_N> tag                       │
│   3. Highlight source text (underline)                  │
│   4. Display annotation card in sidebar                 │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Bidirectional anchoring available             │
│   • Click highlighted text → navigate to annotation     │
│   • Click annotation card → navigate to source text     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Features

### Visual Feedback

1. **Highlight Style**
   - Underline decoration (`decoration-ink-400`)
   - Background color: light yellow (`bg-yellow-100/70`)
   - Active state: deeper yellow (`bg-yellow-200`)
   - Hover effect: background color deepens

2. **Flash Animation**
   - When an anchor is clicked, the target element flashes for 1.6 seconds
   - Smooth effect implemented with CSS animation

3. **Flag Markers**
   - Circular badge showing the annotation count
   - Background color changes on hover
   - Border highlight shown when active

### Keyboard Support

1. **Popup Operations**
   - `ESC` key closes the popup
   - `Tab` key cycles focus between buttons

2. **Annotation Navigation**
   - Highlighted text supports activation via `Enter` and `Space` keys
   - Annotation cards support activation via `Enter` and `Space` keys

3. **Accessibility**
   - All interactive elements have `aria-label`
   - Keyboard navigation supported
   - Compliant with WCAG standards

---

## 📊 Data Flow

### State Management

```
┌──────────────┐
│  rawMarkdown │  (raw data containing <mark_N> tags)
└──────┬───────┘
       │
       ▼ stripMarkTags()
┌──────────────┐
│cleanMarkdown │  (cleaned Markdown)
│boundaryMap   │  (index mapping table)
│annotations   │  (annotation ranges extracted from tags)
└──────┬───────┘
       │
       ▼ ReactMarkdown render
┌──────────────┐
│ Rendered DOM │  (with data-clean-start/end attributes)
└──────┬───────┘
       │
       ▼ User selects text
┌──────────────┐
│selectionState│  (selection state: start, end, text, rect)
└──────┬───────┘
       │
       ▼ User confirms annotation
┌──────────────┐
│injectMarkTags│  (insert tags using boundaryMap)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  rawMarkdown │  (updated data containing new tags)
└──────────────┘
```

---

## 🛠️ Technical Implementation Details

### 1. Position Calculation

- Uses `boundaryMap` to map cleaned indices to original indices
- Tracks text positions via `data-clean-start` and `data-clean-end` attributes
- Uses the `resolveOffset` function to calculate exact selection positions

### 2. Tag Parsing

- Regular expressions match `<mark_N>` and `</mark_N>` tags
- Uses a stack structure to handle nested and overlapping tags
- Generates complete annotation range information

### 3. Bidirectional Anchoring

- Uses `ref` to manage references to highlighted elements and card elements
- `scrollIntoView` API implements smooth scrolling
- `getBoundingClientRect` checks whether an element is within the viewport

### 4. Flag Markers

- Dynamically calculates the position of text segments
- Uses a `Map` to manage the positions of multiple flags
- Renders popups via a Portal to avoid `z-index` issues

---

## 📚 Best Practices

### 1. Data Persistence

```tsx
// Recommended: use controlled mode
const [markdown, setMarkdown] = useState(initialMarkdown);
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  value={markdown}
  onChange={(newMarkdown) => {
    setMarkdown(newMarkdown);
    saveToServer(newMarkdown);
  }}
  annotations={annotations}
  onAnnotationsChange={(newAnnotations) => {
    setAnnotations(newAnnotations);
    saveToServer(newAnnotations);
  }}
/>
```

### 2. Error Handling

```tsx
// Handle tag parsing errors
try {
  const result = stripMarkTags(markdown);
  // use result
} catch (error) {
  console.error('Tag parsing failed:', error);
  // fallback handling
}
```

### 3. Performance Optimization

```tsx
// Use useMemo to cache parsed results
const parseResult = useMemo(() => stripMarkTags(markdown), [markdown]);

// Use useCallback to cache event handler functions
const handleAnnotationFocus = useCallback((id) => {
  // handler logic
}, []);
```

---

## 🎯 Summary

`markdown-annotation-kit` provides a complete document annotation solution, supporting:

✅ **Text selection and annotation creation** — Intuitive interaction  
✅ **Tag system** — Standardized data format  
✅ **Tag echo rendering** — Seamless data restoration  
✅ **Bidirectional anchoring** — Efficient navigation experience  
✅ **Flag markers** — Convenient annotation management  

Suitable for a wide range of scenarios including document review, study notes, code review, and collaborative editing.