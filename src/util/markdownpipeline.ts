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
    // Strip invisible zero-width characters that break parsing
    text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

    // Step 0: Normalize code fence syntax (fix ~~~ or missing newlines)
    text = normalizeCodeblock(text);

    // Step 1: Protect code blocks from being mangled by latex normalization
    text = codeProtector.protect(text);

    // Step 2: Normalize LaTeX delimiters (now safe)
    text = normalizeLatex(text);

    // Step 2.5: Preserve line breaks as hard breaks for preview
    text = preserveHardBreaks(text);

    // Step 3: Restore code blocks
    text = codeProtector.restore(text);

    // Step 4: Pre-sanitize dangerous content
    text = sanitize(text);

    return text;
}

function preserveHardBreaks(text: string): string {
    const lineBreak = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.split(/\r?\n/);

    const out = lines.map((line) => {
        if (line.trim().length === 0) return line;
        if (/%%CINDER_PROTECTED_CODE_\d+%%/.test(line)) return line;
        if (/[ \t]{2}$/.test(line)) return line;
        return `${line}  `;
    });

    return out.join(lineBreak);
}
