/**
 * Normalizes code blocks for consistent syntax highlighting.
 * 
 * This utility ensures fenced code blocks are properly formatted
 * for rehype-highlight to process.
 */
export function normalizeCodeblock(text: string): string {
    let result = text;

    // Normalize code fence variations (e.g., ~~~) to standard backticks
    // Replace ~~~ fences with ``` while preserving language hint
    result = result.replace(/^~~~(\w*)\n([\s\S]*?)^~~~/gm, (_match, lang, code) => {
        return '```' + lang + '\n' + code + '```';
    });

    // Ensure there's a newline after opening fence if missing
    // This helps with consistent parsing
    result = result.replace(/^```(\w+)([^\n])/gm, '```$1\n$2');

    return result;
}
