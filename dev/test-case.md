# Markdown Annotation Component Test Cases

## Test Scenario: Annotation Test with Repeated Text

This document contains multiple instances of the repeated text "annotation" to test whether the component can accurately mark each occurrence.

## Annotated Examples

Below are examples that already include annotation tags:

# Markdown Document <mark_1>Annotation</mark_1> Example

## Functional <mark_2>Features</mark_2>

This is a powerful Markdown annotation component that supports the following features:

- **Text Selection Annotation** - Select any text to add an annotation

- **Bidirectional Anchoring** - Click an annotation card to locate the original text; click highlighted text to <mark_3>locate the annotation</mark_3>

- **Tagging System** - Use `<mark_N></mark_N>` tags to persist annotation data

- **Tag Rendering** - Automatically recognize and render saved annotation tags

## Repeated Text Test Area

### Paragraph 1: Contains Multiple "Annotations"

This is the first paragraph, which contains the word <mark_4>annotation</mark_4>. The purpose of this paragraph is to test whether the component can accurately mark each location when there are multiple identical instances of the text "annotation" in the document. Note that the word <mark_5>annotation</mark_5> appears again here, but in a different location.

### Paragraph 2: More Repeated Text

In the second paragraph, we continue testing the annotation function for repeated text. Here is an <mark_6>annotation</mark_6>, followed by another <mark_7>annotation</mark_7>. Even though the text is identical, each <mark_8>annotation</mark_8> should be marked independently.

### Paragraph 3: Consecutive Repetition

The third paragraph demonstrates consecutive repeated text: <mark_9>annotation</mark_9> and <mark_10>annotation</mark_10> appear right next to each other. This scenario specifically tests the component's ability to calculate positions.

### Paragraph 4: Mixed Scenario

The fourth paragraph mixes annotated and unannotated text. There is a marked <mark_11>annotation</mark_11> here, followed by an unmarked one. The user should be able to proceed to mark the unmarked annotation.

## Repetition in long text

This is a longer passage of text used to test the ability to mark repeated text within a long text. Position calculations can be more complex when the text is long. Here, an <mark_12>annotation</mark_12> appears in the middle of the text. There is more content following this, including another <mark_13>annotation</mark_13> that appears near the end of the text. ## Text within code blocks

Although text inside code blocks generally shouldn't be marked, we have included some examples for testing purposes:

```typescript
// This is a code example
// Includes a comment: annotation feature test
function addAnnotation(text: string) {
return `Annotation: ${text}`;
}
```

## Repetition in lists

- List item 1: List item containing an <mark_14>annotation</mark_14>
- List item 2: Another list item containing an <mark_15>annotation</mark_15>
- List item 3: A third list item containing an <mark_16>annotation</mark_16>
- List item 4: Unmarked annotation (can be marked)

## Repetition in headings

### Heading 1: Heading containing an <mark_17>annotation</mark_17>

### Heading 2: Another heading containing an <mark_18>annotation</mark_18>

### Heading 3: Heading with an unmarked annotation

## Test Instructions

### Test Steps

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

4. **Test accuracy of location calculation**
- Mark the same text at different locations
- Verify that each mark corresponds accurately to the selected location
- Check for positional offsets or duplicate markings

### Expected Results

- All marked "annotations" should be highlighted correctly
- Newly marked "annotations" should be marked accurately at the user-selected location
- Even when identical text appears multiple times, each annotation must be distinct and accurate:
- Annotation sequence numbers should increment based on the order of the annotations.
- Clicking an annotation card should navigate precisely to the corresponding text location.

### Edge Case Testing

1. **Consecutive Duplicate Text**: Testing annotations on identical text that appears consecutively.
2. **Proximity to Existing Annotations**: Testing annotations placed near previously annotated text.
3. **Cross-Paragraph Annotations**: Testing annotations that span multiple paragraphs.
4. **Special Characters**: Testing annotations on text containing special characters.

## Summary

This test case includes:
- 18 annotated text segments.
- Multiple unannotated text segments available for further testing.
- Various scenarios: headings, paragraphs, lists, code blocks, etc.
- Diverse locations: beginning, middle, end, consecutive sequences, etc.

This test case enables comprehensive verification of the component's accuracy and reliability when handling duplicate text.