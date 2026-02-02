import { normalizeLatex } from './normalizeLatex';
import { normalizeCodeblock } from './normalizeCodeblock';
import { sanitize } from './sanitize';

/**
 * Main markdown processing pipeline.
 * 
 * Processes raw markdown text through a series of transformations:
 * 1. normalizeLatex - Converts LaTeX delimiters for remark-math
 * 2. normalizeCodeblock - Normalizes code fences for rehype-highlight
 * 3. sanitize - Pre-render XSS protection
 * 
 * @param rawText - The raw markdown text to process
 * @returns The processed markdown ready for ReactMarkdown
 */
export function processMarkdown(rawText: string): string {
    let text = rawText;

    // Step 1: Normalize LaTeX delimiters
    text = normalizeLatex(text);

    // Step 2: Normalize code blocks
    text = normalizeCodeblock(text);

    // Step 3: Pre-sanitize dangerous content
    text = sanitize(text);

    return text;
}
