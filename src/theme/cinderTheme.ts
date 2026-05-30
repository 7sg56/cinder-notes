/**
 * CodeMirror 6 theme for Cinder Notes.
 *
 * Plain source-mode editing (Obsidian-style):
 * - Monospace font throughout
 * - Tight, compact spacing
 * - Muted syntax colors -- just enough to parse structure at a glance
 * - No size/weight/style changes on any token
 *
 * Automatically syncs with all theme variants via CSS variables.
 */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// -- Editor chrome ------------------------------------------------------------

const cinderEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--editor-bg)',
      color: 'var(--editor-text)',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily:
        "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
      fontSize: '14px',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '.cm-content': {
      padding: '1.5rem 2rem',
      paddingBottom: '40vh',
      lineHeight: '1.6',
      caretColor: 'var(--editor-text)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--editor-text)',
      borderLeftWidth: '1.5px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'var(--editor-selection-bg) !important',
      },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
      fontFamily: 'inherit',
      minWidth: '2.5em',
      padding: '0 8px 0 0',
    },
    '.cm-foldGutter': {
      width: '16px',
    },

    /* -- Search / Find Panel -- */
    '.cm-panels': {
      backgroundColor: 'transparent !important',
      border: 'none !important',
    },
    '.cm-panels-top': {
      position: 'absolute',
      top: '0',
      right: '16px',
      left: 'auto !important',
      zIndex: '10',
      border: 'none !important',
    },
    '.cm-search': {
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-secondary)',
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      padding: '8px 12px !important',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '320px',
      fontFamily: 'inherit',
    },
    '.cm-search br': { display: 'none' },
    '.cm-search input[name=replace]': { display: 'none' },
    '.cm-search button[name=replace]': { display: 'none' },
    '.cm-search button[name=replaceAll]': { display: 'none' },
    '.cm-search button[name=next]': { display: 'none' },
    '.cm-search button[name=prev]': { display: 'none' },
    '.cm-search button[name=select]': { display: 'none' },
    '.cm-search label': { display: 'none' },
    '.cm-search input.cm-textfield': {
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '13px',
      fontFamily: 'inherit',
      outline: 'none',
      flex: '1',
      minWidth: '0',
    },
    '.cm-search input.cm-textfield:focus': {
      borderColor: 'var(--text-secondary)',
    },
    '.cm-search [name=close]': {
      position: 'static !important',
      color: 'var(--text-tertiary)',
      fontSize: '16px',
      padding: '2px 4px',
      borderRadius: '4px',
      cursor: 'pointer',
      flexShrink: '0',
    },
    '.cm-search [name=close]:hover': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-hover)',
    },
    '.cm-searchMatch': {
      backgroundColor: 'var(--editor-selection-bg)',
      borderRadius: '2px',
      outline: '1px solid var(--editor-header-accent)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'var(--editor-header-accent)',
    },
  },
  { dark: true }
);

// -- Syntax highlighting (muted colors, no formatting changes) ----------------

const cinderHighlightStyle = HighlightStyle.define([
  // Headings -- same as body text but tinted with heading color
  { tag: tags.heading1, color: 'var(--markdown-heading)' },
  { tag: tags.heading2, color: 'var(--markdown-heading)' },
  { tag: tags.heading3, color: 'var(--markdown-heading)' },
  { tag: tags.heading4, color: 'var(--markdown-heading)' },
  { tag: tags.heading5, color: 'var(--markdown-heading)' },
  { tag: tags.heading6, color: 'var(--markdown-heading)' },

  // Emphasis -- same color as body, no style changes
  { tag: tags.strong, color: 'var(--editor-text)' },
  { tag: tags.emphasis, color: 'var(--editor-text)' },
  { tag: tags.strikethrough, color: 'var(--text-tertiary)' },

  // Links
  { tag: tags.link, color: 'var(--markdown-link)' },
  { tag: tags.url, color: 'var(--text-tertiary)' },

  // Code -- already monospace, just tint
  { tag: tags.monospace, color: 'var(--markdown-code)' },

  // Lists
  { tag: tags.list, color: 'var(--editor-text)' },

  // Quotes
  { tag: tags.quote, color: 'var(--text-secondary)' },

  // Markup characters (#, ```, **, etc.)
  { tag: tags.processingInstruction, color: 'var(--text-tertiary)' },
  { tag: tags.meta, color: 'var(--text-tertiary)' },

  // Comments
  { tag: tags.comment, color: 'var(--text-tertiary)' },

  // Code block internals
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

// -- Combined extension -------------------------------------------------------

export const cinderTheme: Extension = [
  cinderEditorTheme,
  syntaxHighlighting(cinderHighlightStyle),
];
