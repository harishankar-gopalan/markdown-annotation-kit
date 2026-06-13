/**
 * Use the split method to precisely locate duplicate text based on context.
 * This is a simple, brute-force, yet effective approach: uniquely identifying the location using the surrounding text.
*/
export function getTextPositionByContext(
  clean: string,
  selectedText: string,
  context: { before: string; after: string }
): { start: number; end: number } | null {
  if (!selectedText || !context) {
    return null;
  }

  // Use the split method to split the text.
  const parts = clean.split(selectedText);

  if (parts.length < 2) {
    // No matching text found.
    return null;
  }

  // Normalize contextual text (remove extra whitespace)
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
  const normalizedBefore = normalize(context.before);
  const normalizedAfter = normalize(context.after);

  // Iterate through all possible matching positions and pinpoint the location using the surrounding context.
  let currentPos = 0;
  let bestMatch: {
    start: number;
    end: number;
    beforeScore: number;
    afterScore: number;
  } | null = null;

  for (let i = 0; i < parts.length - 1; i++) {
    const beforePart = parts[i];

    // Calculate current location
    currentPos += beforePart.length;
    const start = currentPos;
    const end = currentPos + selectedText.length;

    // Retrieve the context surrounding this location.
    const contextBefore = clean.slice(
      Math.max(0, start - Math.max(context.before.length, 100)),
      start
    );
    const contextAfter = clean.slice(
      end,
      Math.min(clean.length, end + Math.max(context.after.length, 100))
    );

    // Standardize acquired context
    const normalizedContextBefore = normalize(contextBefore);
    const normalizedContextAfter = normalize(contextAfter);

    // Calculate the match score (number of matching characters)
    let beforeScore = 0;
    let afterScore = 0;

    // Check for preceding matches: compare from back to front.
    if (normalizedBefore.length > 0 && normalizedContextBefore.length > 0) {
      const minLen = Math.min(normalizedBefore.length, normalizedContextBefore.length);
      for (let j = 1; j <= minLen; j++) {
        if (normalizedContextBefore.slice(-j) === normalizedBefore.slice(-j)) {
          beforeScore = j;
        } else {
          break;
        }
      }
    }

    // Check for subsequent matches: Compare from beginning to end.
    if (normalizedAfter.length > 0 && normalizedContextAfter.length > 0) {
      const minLen = Math.min(normalizedAfter.length, normalizedContextAfter.length);
      for (let j = 1; j <= minLen; j++) {
        if (normalizedContextAfter.slice(0, j) === normalizedAfter.slice(0, j)) {
          afterScore = j;
        } else {
          break;
        }
      }
    }

    // If both the preceding and following contexts match perfectly, return immediately.
    if (beforeScore === normalizedBefore.length && afterScore === normalizedAfter.length) {
      return { start, end };
    }

    // Record the best match (prioritizing matches that are strong in both the preceding and following contexts).
    if (!bestMatch) {
      bestMatch = { start, end, beforeScore, afterScore };
    } else {
      const currentTotal = beforeScore + afterScore;
      const bestTotal = bestMatch.beforeScore + bestMatch.afterScore;
      // If the current match is better, or if the total score is the same but the surrounding context matches better...
      if (
        currentTotal > bestTotal ||
        (currentTotal === bestTotal &&
          beforeScore > 0 &&
          afterScore > 0 &&
          (bestMatch.beforeScore === 0 || bestMatch.afterScore === 0))
      ) {
        bestMatch = { start, end, beforeScore, afterScore };
      }
    }

    // Move to the next possible position.
    currentPos += selectedText.length;
  }

  // If a match is found, return the best match
  // Requires at least some matching context on both sides, or only a single matching position
  if (bestMatch) {
    const minBeforeScore = Math.min(3, normalizedBefore.length);
    const minAfterScore = Math.min(3, normalizedAfter.length);

    // If there are matches in both the preceding and following contexts, or if there is only a single matching position, return it.
    if (
      (bestMatch.beforeScore >= minBeforeScore && bestMatch.afterScore >= minAfterScore) ||
      (bestMatch.beforeScore > 0 && bestMatch.afterScore > 0) ||
      parts.length === 2
    ) {
      return { start: bestMatch.start, end: bestMatch.end };
    }
  }

  return null;
}
