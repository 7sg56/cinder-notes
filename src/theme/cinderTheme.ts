/**
 * CodeMirror 6 theme that reads from Cinder's CSS variables.
 * 
 * This automatically syncs with all 12 theme variants since the CSS
 * variables are swapped when the user changes themes.
 */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// ── Editor chrome (backgrounds, gutters, cursors, selections) ────────────────

const cinderEditorTheme = EditorView.theme(
    {
        '&': {
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--editor-text)',
            height: '100%',
            fontSize: '1rem',
        },
        '&.cm-focused': {
            outline: 'none',
        },
        '.cm-content': {
            padding: '2rem 2.5rem',
            lineHeight: '1.85',
            caretColor: 'var(--editor-header-accent)',
            fontFamily: 'inherit',
        },
        '.cm-cursor, .cm-dropCursor': {
            borderLeftColor: 'var(--editor-header-accent)',
            borderLeftWidth: '2px',
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
            backgroundColor: 'var(--editor-selection-bg) !important',
        },
        '.cm-activeLine': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
        '.cm-gutters': {
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--text-tertiary)',
            border: 'none',
            paddingLeft: '8px',
        },
        '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
        },
        '.cm-lineNumbers .cm-gutterElement': {
            fontSize: '12px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            minWidth: '2.5em',
            padding: '0 8px 0 0',
        },
        '.cm-foldGutter': {
            width: '16px',
        },
        // Scrollbar styling matching existing design
        '.cm-scroller': {
            overflow: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-secondary) transparent',
        },
        '.cm-scroller::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '.cm-scroller::-webkit-scrollbar-thumb': {
            background: 'var(--border-secondary)',
            borderRadius: '10px',
        },
        '.cm-scroller::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        // Search panel styling
        '.cm-panels': {
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--border-primary)',
        },
        '.cm-panels .cm-button': {
            backgroundImage: 'none',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '12px',
        },
        '.cm-panels .cm-textfield': {
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '4px',
            fontSize: '13px',
        },
        '.cm-panels .cm-textfield:focus': {
            borderColor: 'var(--editor-header-accent)',
            outline: 'none',
        },
        // Search match highlighting
        '.cm-searchMatch': {
            backgroundColor: 'rgba(244, 140, 37, 0.3)',
            borderRadius: '2px',
        },
        '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: 'rgba(244, 140, 37, 0.6)',
        },
        // Matching bracket highlighting
        '&.cm-focused .cm-matchingBracket': {
            backgroundColor: 'rgba(244, 140, 37, 0.2)',
            outline: '1px solid rgba(244, 140, 37, 0.5)',
        },
        // Placeholder
        '.cm-placeholder': {
            color: 'var(--text-tertiary)',
            fontStyle: 'italic',
        },
        // Tooltip
        '.cm-tooltip': {
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-primary)',
        },
    },
    { dark: true }
);

// ── Syntax highlighting (markdown tokens) ────────────────────────────────────

const cinderHighlightStyle = HighlightStyle.define([
    // Headings (Matching preview sizes and weight)
    { tag: tags.heading1, color: 'var(--markdown-heading)', fontWeight: '650', fontSize: '1.9em', letterSpacing: '-0.02em', lineHeight: '1.3' },
    { tag: tags.heading2, color: 'var(--markdown-heading)', fontWeight: '650', fontSize: '1.45em', letterSpacing: '-0.02em', lineHeight: '1.3' },
    { tag: tags.heading3, color: 'var(--markdown-heading)', fontWeight: '650', fontSize: '1.25em', letterSpacing: '-0.02em', lineHeight: '1.3' },
    { tag: tags.heading4, color: 'var(--markdown-heading)', fontWeight: '650', fontSize: '1.1em', letterSpacing: '-0.02em', lineHeight: '1.3' },
    { tag: tags.heading5, color: 'var(--markdown-heading)', fontWeight: '650', letterSpacing: '-0.02em', lineHeight: '1.3' },
    { tag: tags.heading6, color: 'var(--markdown-heading)', fontWeight: '650', letterSpacing: '-0.02em', lineHeight: '1.3' },

    // Emphasis
    { tag: tags.strong, color: 'var(--markdown-strong, var(--text-primary))', fontWeight: '600' },
    { tag: tags.emphasis, color: 'var(--text-primary)', opacity: '0.9', fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through', color: 'var(--text-secondary)', opacity: '0.6' },

    // Links
    { tag: tags.link, color: 'var(--markdown-link)', textDecoration: 'underline' },
    { tag: tags.url, color: 'var(--markdown-link)', textDecoration: 'underline' },

    // Code
    { tag: tags.monospace, color: 'var(--markdown-code)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: '0.85em', backgroundColor: 'var(--markdown-code-bg)', padding: '0.2em 0.45em', borderRadius: '6px', border: '1px solid var(--border-primary)' },

    // Lists
    { tag: tags.list, color: 'var(--markdown-list, var(--editor-header-accent))' },

    // Quotes
    { tag: tags.quote, color: 'var(--text-secondary)', fontStyle: 'italic' },

    // Meta / markup characters (# , ``` , ** , etc.)
    { tag: tags.processingInstruction, color: 'var(--text-tertiary)' },
    { tag: tags.meta, color: 'var(--text-tertiary)' },

    // Comments
    { tag: tags.comment, color: 'var(--text-tertiary)', fontStyle: 'italic' },

    // Keyword, operator, etc. for code blocks
    { tag: tags.keyword, color: 'var(--markdown-code)' },
    { tag: tags.string, color: 'var(--markdown-link)' },
    { tag: tags.number, color: 'var(--editor-header-accent)' },
    { tag: tags.operator, color: 'var(--text-secondary)' },
    { tag: tags.variableName, color: 'var(--editor-text)' },
    { tag: tags.typeName, color: 'var(--editor-header-accent)' },
    { tag: tags.bool, color: 'var(--editor-header-accent)' },
    { tag: tags.null, color: 'var(--editor-header-accent)' },
    { tag: tags.propertyName, color: 'var(--markdown-link)' },
    { tag: tags.function(tags.variableName), color: 'var(--markdown-link)' },
    { tag: tags.definition(tags.variableName), color: 'var(--markdown-heading)' },
]);

// ── Combined extension ───────────────────────────────────────────────────────

export const cinderTheme: Extension = [
    cinderEditorTheme,
    syntaxHighlighting(cinderHighlightStyle),
];
