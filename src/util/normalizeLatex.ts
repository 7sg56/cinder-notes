/**
 * Normalizes LaTeX delimiters for consistent parsing by remark-math.
 * 
 * Converts:
 * - \(...\) → $...$ (inline math)
 * - \[...\] → $$...$$ (display math)
 */
export function normalizeLatex(text: string): string {
    let result = text;

    // Convert \(...\) to $...$  (inline math)
    // Using non-greedy match to handle multiple inline expressions
    result = result.replace(/\\\((.+?)\\\)/g, (_match, content) => `$${content}$`);

    // Convert \[...\] to $$...$$ (display/block math)
    // Using dotall-like behavior with [\s\S] to match across newlines
    result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_match, content) => `$$${content}$$`);

    return result;
}
