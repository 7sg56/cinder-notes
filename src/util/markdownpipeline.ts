import { normalizeLatex } from './normalizeLatex';
import { normalizeCodeblock } from './normalizeCodeblock';
import { sanitize } from './sanitize';
import { CodeProtector } from './codeProtector';

const codeProtector = new CodeProtector();

/**
 * Main markdown processing pipeline.
 * 
 * SAFE PIPELINE:
 * 1. Normalize code blocks (ensure fences are good)
 * 2. Protect ALL code (fences + inline) -> replace with placeholders
 * 3. Normalize LaTeX (safe to do now)
 * 4. Restore code blocks
 * 5. Sanitize (security)
 * 
 * @param rawText - The raw markdown text to process
 * @returns The processed markdown ready for ReactMarkdown
 */
export function processMarkdown(rawText: string): string {
    let text = rawText;

    // Normalize uncommon line separators (e.g., pasted from ChatGPT)
    text = text.replace(/[\u2028\u2029]/g, '\n');

    // Step 0: Normalize code fence syntax (fix ~~~ or missing newlines)
    text = normalizeCodeblock(text);

    // Step 1: Protect code blocks from being mangled by latex normalization
    text = codeProtector.protect(text);

    // Step 2: Normalize LaTeX delimiters (now safe)
    text = normalizeLatex(text);

    // Step 3: Restore code blocks
    text = codeProtector.restore(text);

    // Step 4: Pre-sanitize dangerous content
    text = sanitize(text);

    return text;
}
