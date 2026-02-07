/**
 * Utility to protect code blocks from being modified by other normalization steps.
 * 
 * It replaces code blocks with unique placeholders and restores them later.
 */

export class CodeProtector {
    private placeholders: Map<string, string> = new Map();
    private counter = 0;

    /**
     * Replaces code blocks (fenced and inline) with placeholders.
     */
    protect(text: string): string {
        this.placeholders.clear();
        this.counter = 0;

        const lineBreak = text.includes('\r\n') ? '\r\n' : '\n';
        const lines = text.split(/\r?\n/);
        const out: string[] = [];

        let inFence = false;
        let fenceChar = '';
        let fenceLen = 0;
        let quoteDepth = 0;
        let buffer: string[] = [];

        for (const line of lines) {
            if (!inFence) {
                const open = this.detectFenceOpen(line);
                if (open) {
                    inFence = true;
                    fenceChar = open.fenceChar;
                    fenceLen = open.fenceLen;
                    quoteDepth = open.quoteDepth;
                    buffer = [line];
                } else {
                    out.push(line);
                }
                continue;
            }

            buffer.push(line);
            if (this.isFenceClose(line, fenceChar, fenceLen, quoteDepth)) {
                inFence = false;
                out.push(this.createPlaceholder(buffer.join(lineBreak)));
                buffer = [];
            }
        }

        if (inFence && buffer.length > 0) {
            out.push(this.createPlaceholder(buffer.join(lineBreak)));
        }

        let protectedText = out.join(lineBreak);

        // Protect inline code `...`
        // We use a non-greedy match.
        protectedText = protectedText.replace(
            /(`+)([^`]+)\1/g,
            (match) => this.createPlaceholder(match)
        );

        return protectedText;
    }

    /**
     * Restores the original code blocks from placeholders.
     */
    restore(text: string): string {
        let restoredText = text;

        // We might have placeholders inside other placeholders if we weren't careful,
        // but our regexes shouldn't overlap. 
        // We iterate specifically over our known keys to avoid accidental replacements.

        // However, simple string replacement is safer if we just loop the map.
        this.placeholders.forEach((original, placeholder) => {
            restoredText = restoredText.replace(placeholder, () => original);
        });

        return restoredText;
    }

    private createPlaceholder(content: string): string {
        const placeholder = `%%CINDER_PROTECTED_CODE_${this.counter++}%%`;
        this.placeholders.set(placeholder, content);
        return placeholder;
    }

    private detectFenceOpen(line: string): { fenceChar: string; fenceLen: number; quoteDepth: number } | null {
        const match = line.match(/^([ \t]*(?:>[ \t]*)*)(.*)$/);
        if (!match) return null;

        const prefix = match[1];
        const rest = match[2];
        const listMatch = rest.match(/^(\s*(?:[-*+]|[0-9]+[.)])\s+)(.*)$/);
        const afterList = listMatch ? listMatch[2] : rest;
        const fenceMatch = afterList.match(/^(`{3,}|~{3,})(.*)$/);
        if (!fenceMatch) return null;

        const fence = fenceMatch[1];
        const quoteDepth = (prefix.match(/>/g) || []).length;

        return {
            fenceChar: fence[0],
            fenceLen: fence.length,
            quoteDepth
        };
    }

    private isFenceClose(line: string, fenceChar: string, fenceLen: number, quoteDepth: number): boolean {
        const quotePart = quoteDepth > 0
            ? `[ \\t]*(?:>[ \\t]*){${quoteDepth}}`
            : `[ \\t]*`;
        const pattern = `^${quotePart}${fenceChar}{${fenceLen},}\\s*$`;
        return new RegExp(pattern).test(line);
    }
}
