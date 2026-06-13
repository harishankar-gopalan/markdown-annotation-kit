export type ParsedMark = { id: number; start: number; end: number };

export type BoundaryMap = number[];

export type StripResult = {
  clean: string;
  boundaryMap: BoundaryMap;
  marks: ParsedMark[];
};

export function stripMarkTags(raw: string): StripResult {
  const boundaryMap: number[] = [];
  const marks: ParsedMark[] = [];
  let clean = "";
  let i = 0;
  const len = raw.length;
  const stack: { id: number; start: number }[] = [];

  // Track whether the code is inside a code block (``` or ```language).
  let inCodeBlock = false;

  // Track whether it is in inline code (`）
  let inInlineCode = false;

  while (i < len) {
    // Check the start/end of the code block (```）
    if (raw.startsWith("```", i)) {
      // Check if it is a code block marker (preceded by a newline or the start of the string, and followed by a newline, space, alphanumeric character, or the end of the string).
      const beforeIsNewlineOrStart = i === 0 || raw[i - 1] === "\n" || raw[i - 1] === "\r";
      const afterChar = i + 3 < len ? raw[i + 3] : "";
      const isCodeBlockMarker =
        beforeIsNewlineOrStart &&
        (afterChar === "\n" ||
          afterChar === "\r" ||
          afterChar === "" ||
          /[a-zA-Z0-9\s]/.test(afterChar));

      if (isCodeBlockMarker) {
        inCodeBlock = !inCodeBlock;
        // Treat code block markers as plain text
        // Handle the complete ``` tag (3 characters).
        for (let k = 0; k < 3 && i < len; k++) {
          boundaryMap.push(i);
          clean += raw[i];
          i += 1;
        }
        continue;
      }
    }

    // Check for inline code (`), but not within code blocks.
    if (!inCodeBlock && raw[i] === "`") {
      // Check for any other characters (other than ```) before or after.
      const prevChars = i >= 2 ? raw.slice(i - 2, i) : "";
      const nextChars = i + 3 <= len ? raw.slice(i + 1, i + 3) : "";
      // Simple inline code detection: not part of ```
      if (prevChars !== "``" && nextChars !== "``") {
        inInlineCode = !inInlineCode;
      }
    }

    // Check for <mark> tags (whether inside a code block or not)
    // Note: We need to parse <mark> tags even within code blocks to enable subsequent highlighting in the DOM.
    if (raw[i] === "<") {
      // Check if it is the start of a <mark> tag.
      if (raw.startsWith("<mark_", i)) {
        let j = i + 6;
        let num = "";
        // Read the number ID
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        // Check if it is a complete `mark` tag (ending with `>`).
        if (j < len && raw[j] === ">") {
          const id = Number(num);
          stack.push({ id, start: clean.length });
          // Pass the entire <mark_id> tag
          i = j + 1;
          continue;
        }
        // If it is not a complete `<mark>` tag, treat it as plain text.
      } else if (raw.startsWith("</mark_", i)) {
        // Check if it is the end of a <mark> tag.
        let j = i + 7;
        let num = "";
        // Read the number ID
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        // Check if it is a complete `mark` tag (ending with `>`).
        if (j < len && raw[j] === ">") {
          const id = Number(num);
          const openIndex = stack.findIndex((s) => s.id === id);
          if (openIndex !== -1) {
            const open = stack[openIndex];
            marks.push({ id, start: open.start, end: clean.length });
            stack.splice(openIndex, 1);
          }
          // Skip the entire </mark_id> tag
          i = j + 1;
          continue;
        }
        // If it is not a complete `<mark>` tag, treat it as plain text.
      }
    }

    // If within inline code, do not parse other content; treat it simply as plain text.
    // Note: Content within code blocks must also be preserved, though the <mark> tag has already been parsed.
    if (inInlineCode && raw[i] !== "<") {
      boundaryMap.push(i);
      clean += raw[i];
      i += 1;
      continue;
    }

    // Other cases (including plain text within code blocks) are handled normally.
    boundaryMap.push(i);
    clean += raw[i];
    i += 1;
  }
  return { clean, boundaryMap, marks: marks.sort((a, b) => a.start - b.start) };
}

export function injectMarkTags(
  raw: string,
  boundaryMap: number[],
  startClean: number,
  endClean: number,
  id: number
): string {
  // Calculate the exact position in the raw markdown
  // boundaryMap[i] represents the position in the raw markdown of the i-th character in the clean markdown
  let startRaw: number;
  let endRaw: number;

  if (startClean < boundaryMap.length) {
    startRaw = boundaryMap[startClean];
  } else {
    // If out of range, use the end of raw
    startRaw = raw.length;
  }

  if (endClean <= boundaryMap.length) {
    if (endClean === 0) {
      endRaw = 0;
    } else if (endClean === boundaryMap.length) {
      // If endClean equals the length of boundaryMap, it indicates the position after the last character.
      endRaw = raw.length;
    } else {
      // endClean: the position within raw
      endRaw = boundaryMap[endClean];
    }
  } else {
    endRaw = raw.length;
  }

  // Ensure endRaw >= startRaw
  if (endRaw < startRaw) {
    endRaw = startRaw;
  }

  const left = raw.slice(0, startRaw);
  const mid = raw.slice(startRaw, endRaw);
  const right = raw.slice(endRaw);
  return `${left}<mark_${id}>${mid}</mark_${id}>${right}`;
}
