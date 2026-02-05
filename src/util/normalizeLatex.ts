/**
 * Normalizes LaTeX delimiters for consistent parsing by remark-math.
 * 
 * STRICT MODE (SAFETY PRIORITY):
 * - PRESERVE STRUCTURE: Keeps indentation/list/blockquote prefixes intact.
 * - SAFETY: Checks for unclosed delimiters.
 * - SELECTIVE: Only converts standalone display blocks.
 */
export function normalizeLatex(text: string): string {
    let result = text;

    // 1. Convert standard inline \( ... \) → $...$
    result = result.replace(/\\\(([\s\S]+?)\\\)/g, (_match, content) => `$${content}$`);

    // 2. Convert standard display \[ ... \] → $$...$$
    // Preserve indentation and list/block quote structure by replacing delimiters in-place.
    const lineBreak = result.includes('\r\n') ? '\r\n' : '\n';
    const lines = result.split(/\r?\n/);
    const out: string[] = [];

    let inDisplay = false;
    let inBracket = false;
    let bracketOpen: { line: string; quotePrefix: string; listPrefix: string; afterList: string } | null = null;
    let bracketLines: string[] = [];

    const splitQuotePrefix = (line: string) => {
        const match = line.match(/^([ \t]*(?:>[ \t]*)*)(.*)$/);
        return {
            quotePrefix: match ? match[1] : '',
            rest: match ? match[2] : line
        };
    };

    const splitListPrefix = (textLine: string) => {
        const match = textLine.match(/^(\s*(?:[-*+]|[0-9]+[.)])\s+)(.*)$/);
        return {
            listPrefix: match ? match[1] : '',
            rest: match ? match[2] : textLine
        };
    };

    const replaceInlineMath = (input: string) => {
        let next = input;

        // Inline \[ ... \] -> $...$ when used mid-line
        next = next.replace(/\\\[(.+?)\\\]/g, (_match, content) => {
            const inner = String(content).trim();
            return inner.length > 0 ? `$${inner}$` : _match;
        });

        // Inline ChatGPT-style [ \command ... ] -> $...$
        // Only when content starts with "\" and has no nested [] to avoid false positives.
        next = next.replace(/(?<!\\)\[\s*(\\[^\]\[\n]+?)\s*](?!\()/g, (_match, content) => {
            const inner = String(content).trim();
            return inner.length > 0 ? `$${inner}$` : _match;
        });

        return next;
    };

    const replaceBracketOpen = (open: { quotePrefix: string; listPrefix: string; afterList: string }) => {
        const replaced = open.afterList.replace(/\[\s*$/, '$$');
        return `${open.quotePrefix}${open.listPrefix}${replaced}`;
    };

    const replaceBracketClose = (quotePrefix: string, listPrefix: string, afterList: string) => {
        const replaced = afterList.replace(/\]\s*$/, '$$');
        return `${quotePrefix}${listPrefix}${replaced}`;
    };

    for (const line of lines) {
        const { quotePrefix, rest } = splitQuotePrefix(line);
        const { listPrefix, rest: afterList } = splitListPrefix(rest);
        const trimmed = afterList.trim();

        if (!inDisplay && !inBracket) {
            if (trimmed === '[') {
                inBracket = true;
                bracketOpen = { line, quotePrefix, listPrefix, afterList };
                bracketLines = [];
                continue;
            }

            // Single-line display: \[ ... \]
            const singleLineMatch = afterList.match(/^\\\[(.*)\\\]\s*$/);
            if (singleLineMatch) {
                const inner = singleLineMatch[1].trim();
                const continuationPrefix = quotePrefix + listPrefix.replace(/[^\t ]/g, ' ');
                out.push(`${quotePrefix}${listPrefix}$$`);
                if (inner.length > 0) out.push(`${continuationPrefix}${inner}`);
                out.push(`${continuationPrefix}$$`);
                continue;
            }

            // ChatGPT-style [ \command ... ] (standalone line only)
            const bracketMatch = afterList.match(/^\[(.*)\]\s*$/);
            if (bracketMatch) {
                const innerRaw = bracketMatch[1];
                const inner = innerRaw.trim();

                if (
                    inner.length > 0 &&
                    inner.length <= 1000 &&
                    inner.startsWith('\\') &&
                    !/#{2,}|\s-{3,}\s/.test(inner)
                ) {
                    const continuationPrefix = quotePrefix + listPrefix.replace(/[^\t ]/g, ' ');
                    out.push(`${quotePrefix}${listPrefix}$$`);
                    out.push(`${continuationPrefix}${inner}`);
                    out.push(`${continuationPrefix}$$`);
                    continue;
                }
            }

            // Multi-line display start: \[
            if (trimmed === '\\[') {
                inDisplay = true;
                const replaced = afterList.replace(/\\\[\s*$/, '$$');
                out.push(`${quotePrefix}${listPrefix}${replaced}`);
                continue;
            }

            const inlineConverted = replaceInlineMath(afterList);
            out.push(`${quotePrefix}${listPrefix}${inlineConverted}`);
            continue;
        }

        if (inBracket) {
            if (trimmed === ']') {
                const hasBackslash = bracketLines.some((contentLine) => /\\/.test(contentLine));
                if (bracketOpen && hasBackslash) {
                    out.push(replaceBracketOpen(bracketOpen));
                    out.push(...bracketLines);
                    out.push(replaceBracketClose(quotePrefix, listPrefix, afterList));
                } else {
                    if (bracketOpen) out.push(bracketOpen.line);
                    out.push(...bracketLines);
                    out.push(line);
                }
                inBracket = false;
                bracketOpen = null;
                bracketLines = [];
                continue;
            }

            bracketLines.push(line);
            continue;
        }

        // Multi-line display end: \]
        if (trimmed === '\\]') {
            inDisplay = false;
            const replaced = afterList.replace(/\\\]\s*$/, '$$');
            out.push(`${quotePrefix}${listPrefix}${replaced}`);
            continue;
        }

        out.push(line);
    }

    if (inDisplay) {
        out.push('$$');
    }

    if (inBracket) {
        if (bracketOpen) out.push(bracketOpen.line);
        if (bracketLines.length > 0) out.push(...bracketLines);
    }

    result = out.join(lineBreak);

    // 3. Remove \displaystyle keyword (common ChatGPT rendering hint that breaks some renders)
    result = result.replace(/\\displaystyle\s*/g, '');

    // 4. SAFETY NET: Balance check
    // If we have an odd number of $$, assume the last one is unclosed and close it.
    // This prevents "red text of death" (mode leakage) for the rest of the document.
    const delimiterCount = (result.match(/\$\$/g) || []).length;
    if (delimiterCount % 2 !== 0) {
        result += `${lineBreak}$$${lineBreak}`;
    }

    return result;
}
