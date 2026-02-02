/**
 * Normalizes LaTeX delimiters for consistent parsing by remark-math.
 * 
 * Converts:
 * - \(...\) → $...$ (inline math)
 * - \[...\] → $$...$$ (display math)
 * - Standalone [...] → $$...$$ (ChatGPT format - [ and ] on their own lines)
 */
export function normalizeLatex(text: string): string {
    let result = text;

    // Convert \(...\) to $...$  (inline math)
    result = result.replace(/\\\((.+?)\\\)/g, (_match, content) => `$${content}$`);

    // Convert \[...\] to $$...$$ (display/block math)
    result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_match, content) => `$$${content}$$`);

    // Convert ChatGPT-style block math: standalone [ ] delimiters
    // Pattern: A line that is ONLY "[" (with optional whitespace), followed by content,
    // followed by a line that is ONLY "]" (with optional whitespace)
    // This avoids matching \left[ or \right] which are LaTeX bracket commands
    result = result.replace(
        /^(\s*)\[[ \t]*$/gm, // Line that is just "["
        '$1$$' // Replace with $$
    );
    result = result.replace(
        /^(\s*)\][ \t]*$/gm, // Line that is just "]"
        '$1$$' // Replace with $$
    );

    return result;
}
