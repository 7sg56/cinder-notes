/**
 * Pre-render sanitization for markdown content.
 * 
 * Note: This is a lightweight pre-sanitization step.
 * The main XSS protection is handled by rehype-sanitize during rendering.
 * 
 * This function removes obviously dangerous patterns before markdown parsing.
 */
export function sanitize(text: string): string {
    let result = text;

    // Remove script tags and their content
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove inline event handlers (onclick, onerror, etc.)
    result = result.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove javascript: protocol in URLs
    result = result.replace(/javascript\s*:/gi, '');

    // Remove data: protocol URLs that could be dangerous (except images)
    result = result.replace(/data\s*:\s*(?!image\/)[^)\s"']*/gi, '');

    return result;
}
