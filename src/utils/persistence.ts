import { AnnotationItem } from "../MarkdownAnnotator";
import { ParsedMark } from "./mark";

/**
 * Complete structure of annotation data for persistence
 */
export interface AnnotationData {
  /**
   * List of annotations
   */
  annotations: AnnotationItem[];
  /**
   * Mark location information
   */
  marks: ParsedMark[];
  /**
   * Raw Markdown content (including tags)
   */
  markdown: string;
  /**
   * Cleaned Markdown content (excluding tags)
   */
  cleanMarkdown: string;
  /**
   * Version number, used for compatibility checks.
   */
  version: string;
  /**
   * Creation timestamp
   */
  createdAt: number;
  /**
   * Update timestamp
   */
  updatedAt: number;
}

/**
 * Export annotation data as a JSON string
 * @param markdown Raw Markdown containing tags
 * @param annotations List of annotations
 * @param marks Mark location information
 * @param cleanMarkdown Cleaned Markdown (optional; automatically calculated if not provided)
 * @returns JSON string
 */
export function exportAnnotationData(
  markdown: string,
  annotations: AnnotationItem[],
  marks: ParsedMark[],
  cleanMarkdown?: string
): string {
  const data: AnnotationData = {
    annotations,
    marks,
    markdown,
    cleanMarkdown: cleanMarkdown || markdown.replace(/<mark_\d+>|<\/mark_\d+>/g, ""),
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import annotation data from a JSON string
 * @param jsonString JSON string
 * @returns Annotation data object
 * @throws If the JSON format is invalid or the version is incompatible
 */
export function importAnnotationData(jsonString: string): AnnotationData {
  try {
    const data = JSON.parse(jsonString) as AnnotationData;

    // Validate required fields
    if (!data.annotations || !Array.isArray(data.annotations)) {
      throw new Error("Invalid annotation data: annotations must be an array");
    }

    if (!data.marks || !Array.isArray(data.marks)) {
      throw new Error("Invalid annotation data: marks must be an array");
    }

    if (typeof data.markdown !== "string") {
      throw new Error("Invalid annotation data: markdown must be a string");
    }

    // Update timestamp
    data.updatedAt = Date.now();
    if (!data.createdAt) {
      data.createdAt = Date.now();
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Export annotation data in a simplified format (containing only annotations and markers, excluding Markdown)
 * Suitable for scenarios requiring only annotation data
 */
export interface SimplifiedAnnotationData {
  annotations: AnnotationItem[];
  marks: ParsedMark[];
  version: string;
  updatedAt: number;
}

/**
 * Export annotation data in a simplified format
 * @param annotations List of annotations
 * @param marks Marker position information
 * @returns JSON string
 */
export function exportSimplifiedAnnotationData(
  annotations: AnnotationItem[],
  marks: ParsedMark[]
): string {
  const data: SimplifiedAnnotationData = {
    annotations,
    marks,
    version: "1.0.0",
    updatedAt: Date.now(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import annotation data from a simplified format
 * @param jsonString JSON string
 * @returns Annotation data in the simplified format
 */
export function importSimplifiedAnnotationData(jsonString: string): SimplifiedAnnotationData {
  try {
    const data = JSON.parse(jsonString) as SimplifiedAnnotationData;

    if (!data.annotations || !Array.isArray(data.annotations)) {
      throw new Error("Invalid annotation data: annotations must be an array");
    }

    if (!data.marks || !Array.isArray(data.marks)) {
      throw new Error("Invalid annotation data: marks must be an array");
    }

    data.updatedAt = Date.now();

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Type definition for the persistence callback function
 */
export type PersistenceCallback = (data: AnnotationData) => void | Promise<void>;

/**
 * Create a debounced persistent function
 * @param callback Persistent callback function
 * @param delay Debounce delay (milliseconds), default 500ms
 * @returns Debounced persistent function
 */
export function createDebouncedPersistence(
  callback: PersistenceCallback,
  delay: number = 500
): (data: AnnotationData) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (data: AnnotationData) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(data);
      timeoutId = null;
    }, delay);
  };
}
