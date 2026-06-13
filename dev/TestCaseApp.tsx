import { useState, useMemo } from 'react';
import { MarkdownAnnotator, AnnotationItem } from '../src/index';

// Test cases containing large amounts of repetitive text and annotations.
const TEST_MARKDOWN = `# Markdown Document <mark_1>Annotation</mark_1> Example

## <mark_2>Features</mark_2>

This is a powerful Markdown annotation component that supports the following features:

- **Text Selection Annotation** - Select any text to add an annotation

- **Bidirectional Anchoring** - Click an annotation card to locate the original text; click highlighted text to <mark_3>locate the annotation</mark_3>

- **Tag System** - Use \`<mark_N></mark_N>\` tags to persist annotation data

- **Tag Rendering** - Automatically recognize and render saved annotation tags

## Repeated Text Test Area

### Paragraph 1: Contains multiple instances of "Annotation"

This is the first paragraph, which contains the word <mark_4>annotation</mark_4>. The purpose of this paragraph is to test whether the component can accurately mark each location when there are multiple identical instances of the text "annotation" in the document. Note that the word <mark_5>annotation</mark_5> appears again here, but in a different location.

### Paragraph 2: More repeated text

In the second paragraph, we continue testing the annotation function for repeated text. Here is an <mark_6>annotation</mark_6>, followed by another <mark_7>annotation</mark_7>. Even though the text is identical, each <mark_8>annotation</mark_8> should be marked independently.

### Paragraph 3: Consecutive repetition

The third paragraph demonstrates consecutive repeated text: <mark_9>annotation</mark_9> and <mark_10>annotation</mark_10> appear right next to each other. This scenario particularly tests the component's ability to calculate positions.

### Paragraph 4: Mixed scenarios

The fourth paragraph mixes marked and unmarked text. Here is a marked <mark_11>annotation</mark_11>, followed by an unmarked annotation. Users should be able to proceed to mark the unmarked annotation.

## Repetition in long text

This is a longer paragraph used to test the ability to mark repeated text within a long passage. Position calculation can be more complex when the text is lengthy. Here is a <mark_12>comment</mark_12> appearing in the middle of the text. There is more content following it, including another <mark_13>comment</mark_13> near the end of the text. ## Text within code blocks

Although text inside code blocks generally shouldn't be marked, we have included some examples for testing purposes:

\`\`\`typescript
// This is a code example
// Contains annotations: annotation feature test
function addAnnotation(text: string) {
return \`Annotation: \${text}\`;
}
\`\`\`

## Repetition in lists

- List item one: a list item containing an <mark_14>annotation</mark_14>
- List item two: another list item containing an <mark_15>annotation</mark_15>
- List item three: a third list item containing an <mark_16>annotation</mark_16>
- List item four: an unmarked annotation (can be marked)

## Repetition in headings

### Heading one: a heading containing an <mark_17>annotation</mark_17>

### Heading two: another heading containing an <mark_18>annotation</mark_18>

### Heading three: a heading with an unmarked annotation

## Test instructions

### Test steps

1. **Test rendering of marked text**
- Check that all marked "annotations" are highlighted correctly
- Check that the sidebar correctly displays all annotation cards

2. **Test accuracy of new markings**
- Select unmarked "annotation" text
- Add an annotation and check if it is marked correctly at the selected location
- Verify that it does not affect other marked text

3. **Test independent marking of repeated text**
- Mark all unmarked "annotations" one by one
- Verify that each "annotation" is marked independently without interference
- Check that annotation sequence numbers increment correctly

4. **Test accuracy of position calculation**
- Mark identical text at different locations
- Verify that each mark corresponds accurately to the selected location
- Check for positional offsets or duplicate markings

### Expected results

- All marked "annotations" should be highlighted correctly
- Newly created "annotations" should be accurately marked at the user's selected location.
- Even when identical text appears multiple times, each mark must be independent and accurate.
- Annotation sequence numbers should increment based on the order in which they are marked.
- Clicking an annotation card should navigate precisely to the corresponding text location.

### Edge Case Testing

1. **Consecutive Repeated Text**: Test marking identical text that appears consecutively.
2. **Near Existing Annotations**: Test marking new text adjacent to previously marked text.
3. **Cross-Paragraph Marking**: Test marking text that spans multiple paragraphs.
4. **Special Characters**: Test marking text that contains special characters.

## Summary

This test case includes:
- 18 pieces of text already marked as "annotations."
- Multiple unmarked text segments available for further testing.
- Various scenarios: headings, paragraphs, lists, code blocks, etc.
- Different positions: beginning, middle, end, consecutive sequences, etc.

This test case allows for a comprehensive verification of the component's accuracy and reliability when handling repeated text.`;

// Predefined annotation data (corresponding to 18 labeled texts)
const TEST_ANNOTATIONS: AnnotationItem[] = [
  { id: 1, note: 'Annotation in the title - Marker location: Title' },
  { id: 2, note: 'Annotation in features - Marker location: Features title' },
  { id: 3, note: 'Navigate to annotation - Marker location: Bidirectional anchoring description' },
  { id: 4, note: 'First annotation in paragraph 1 - Marker location: Start of paragraph 1' },
  { id: 5, note: 'Second annotation in paragraph 1 - Marker location: Middle of paragraph 1' },
  { id: 6, note: 'First annotation in paragraph 2 - Marker location: Start of paragraph 2' },
  { id: 7, note: 'Second annotation in paragraph 2 - Marker location: Middle of paragraph 2' },
  { id: 8, note: 'Third annotation in paragraph 2 - Marker location: End of paragraph 2' },
  { id: 9, note: 'First annotation in paragraph 3 - Marker location: Repeated text instance 1' },
  { id: 10, note: 'Second annotation in paragraph 3 - Marker location: Repeated text instance 2' },
  { id: 11, note: 'Annotation in paragraph 4 - Marker location: Mixed scenario' },
  { id: 12, note: 'Annotation in middle of long text - Marker location: Middle of long text' },
  { id: 13, note: 'Annotation at end of long text - Marker location: End of long text' },
  { id: 14, note: 'Annotation on list item 1 - Marker location: First list item' },
  { id: 15, note: 'Annotation on list item 2 - Marker location: Second list item' },
  { id: 16, note: 'Annotation on list item 3 - Marker location: Third list item' },
  { id: 17, note: 'Annotation on heading 1 - Marker location: Heading 1' },
  { id: 18, note: 'Annotation on heading 2 - Marker location: Heading 2' },
];

function TestCaseApp() {
  const [markdown, setMarkdown] = useState(TEST_MARKDOWN);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(TEST_ANNOTATIONS);

  const markdownPreview = useMemo(() => {
    return markdown;
  }, [markdown]);

  const annotationsJson = useMemo(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  const stats = useMemo(() => {
    const totalMarks = (markdown.match(/<mark_\d+>/g) || []).length;
    const totalAnnotations = annotations.length;
    const unmarkedText = (markdown.match(/annotation/g) || []).length - totalMarks;
    return { totalMarks, totalAnnotations, unmarkedText };
  }, [markdown, annotations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header Information */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1f2937' }}>
          Markdown Annotation Kit - Duplicate Text Test Cases
        </h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
          <span>Marked quantity: <strong style={{ color: '#2563eb' }}>{stats.totalMarks}</strong></span>
          <span>Number of comments: <strong style={{ color: '#2563eb' }}>{stats.totalAnnotations}</strong></span>
          <span>Unmarked "comments": <strong style={{ color: '#dc2626' }}>{stats.unmarkedText}</strong></span>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          Test scenario: Contains a large amount of repetitive "annotation" text; verifies whether the component can accurately mark each location.
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
        />
      </div>

      {/* Bottom Data Preview */}
      <div
        style={{
          height: '200px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '20px',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            Current Markdown (including tags) 
          </h3>
          <textarea
            readOnly
            value={markdownPreview}
            style={{
              width: '100%',
              height: '150px',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            Annotation data (JSON) 
          </h3>
          <pre
            style={{
              width: '100%',
              height: '150px',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              backgroundColor: '#f9fafb',
              overflow: 'auto',
              margin: 0,
            }}
          >
            {annotationsJson}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TestCaseApp;

