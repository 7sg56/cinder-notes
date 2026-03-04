/**
 * CodeMirror 6 theme that reads from Cinder's CSS variables.
 *
 * This automatically syncs with all 12 theme variants since the CSS
 * variables are swapped when the user changes themes.
 */

import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ── Editor chrome (backgrounds, gutters, cursors, selections) ────────────────

const cinderEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--editor-bg)",
    color: "var(--editor-text)",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "'Space Grotesk', system-ui, Avenir, Helvetica, Arial, sans-serif !important",
    WebkitFontSmoothing: "antialiased",
  },
  "&.cm-focused": {
    outline: "none"
  },
  ".cm-content": {
    padding: "2.5rem 3rem",
    paddingBottom: "6rem",
    lineHeight: "1.85",
    caretColor: "var(--editor-header-accent)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--editor-header-accent)",
    borderLeftWidth: "2px"
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--editor-selection-bg) !important"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.03)"
  },
  ".cm-gutters": {
    backgroundColor: "var(--editor-bg)",
    color: "var(--text-tertiary)",
    border: "none",
    paddingLeft: "8px"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--text-secondary)"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    fontSize: "12px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    minWidth: "2.5em",
    padding: "0 8px 0 0"
  },
  ".cm-foldGutter": {
    width: "16px"
  },
  /* AST STYLING */
  ".cm-paragraph-line": {
    paddingTop: "0.6em",
    paddingBottom: "0.6em"
  },
  ".cm-md-mark": {
    opacity: "0.35",
    transition: "opacity 0.2s ease"
  },
  "&.cm-focused .cm-activeLine .cm-md-mark": {
    opacity: "0.75"
  },
  ".cm-md-inline-code": {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: "0.25em 0.5em",
    borderRadius: "6px",
    fontSize: "0.85em",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "var(--text-primary)",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
  },
  ".cm-codeblock-line": {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingLeft: "1.3em",
    paddingRight: "1.3em",
    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)"
  },
  ".cm-codeblock-line *": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "0.9em",
    lineHeight: "1.65"
  },
  ".cm-heading-line": {
    fontWeight: "650",
    lineHeight: "1.3",
    letterSpacing: "-0.02em",
    color: "var(--markdown-heading)",
    paddingTop: "1.4em",
    paddingBottom: "0.5em"
  },
  ".cm-heading-line.cm-h1, .cm-heading-line.cm-h1 *": { fontSize: "1.9rem !important" },
  ".cm-heading-line.cm-h2, .cm-heading-line.cm-h2 *": { fontSize: "1.45rem !important" },
  ".cm-heading-line.cm-h3, .cm-heading-line.cm-h3 *": { fontSize: "1.25rem !important" },
  ".cm-heading-line.cm-h4, .cm-heading-line.cm-h4 *": { fontSize: "1.1rem !important" },
  ".cm-blockquote-line": {
    background: "linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))",
    boxShadow: "inset 4px 0 0 var(--editor-header-accent)",
    color: "var(--text-secondary)",
    paddingLeft: "1.6em",
    paddingTop: "0.2em",
    paddingBottom: "0.2em",
    fontStyle: "italic",
    border: "1px solid rgba(255, 255, 255, 0.03)",
    borderLeft: "none"
  }
}, { dark: true });

// ── Syntax highlighting (markdown tokens) ────────────────────────────────────

const cinderHighlightStyle = HighlightStyle.define([
  // Headings (Matching preview sizes and weight)
  {
    tag: tags.heading1,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.9rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading2,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.45rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading3,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.25rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading4,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.1em",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading5,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading6,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },

  // Emphasis
  {
    tag: tags.strong,
    color: "var(--markdown-strong, var(--text-primary))",
    fontWeight: "600",
  },
  {
    tag: tags.emphasis,
    color: "var(--text-primary)",
    opacity: "0.9",
    fontStyle: "italic",
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through",
    color: "var(--text-secondary)",
    opacity: "0.6",
  },

  // Links
  {
    tag: tags.link,
    color: "var(--markdown-link)",
    textDecoration: "underline",
  },
  { tag: tags.url, color: "var(--markdown-link)", textDecoration: "underline" },

  // Code
  {
    tag: tags.monospace,
    color: "var(--markdown-code)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "0.85em",
    backgroundColor: "var(--markdown-code-bg)",
    padding: "0.2em 0.45em",
    borderRadius: "6px",
    border: "1px solid var(--border-primary)",
  },

  // Lists
  {
    tag: tags.list,
    color: "var(--markdown-list, var(--editor-header-accent))",
  },

  // Quotes
  { tag: tags.quote, color: "var(--text-secondary)", fontStyle: "italic" },

  // Meta / markup characters (# , ``` , ** , etc.)
  { tag: tags.processingInstruction, color: "var(--text-tertiary)" },
  { tag: tags.meta, color: "var(--text-tertiary)" },

  // Comments
  { tag: tags.comment, color: "var(--text-tertiary)", fontStyle: "italic" },

  // Keyword, operator, etc. for code blocks
  { tag: tags.keyword, color: "var(--markdown-code)" },
  { tag: tags.string, color: "var(--markdown-link)" },
  { tag: tags.number, color: "var(--editor-header-accent)" },
  { tag: tags.operator, color: "var(--text-secondary)" },
  { tag: tags.variableName, color: "var(--editor-text)" },
  { tag: tags.typeName, color: "var(--editor-header-accent)" },
  { tag: tags.bool, color: "var(--editor-header-accent)" },
  { tag: tags.null, color: "var(--editor-header-accent)" },
  { tag: tags.propertyName, color: "var(--markdown-link)" },
  { tag: tags.function(tags.variableName), color: "var(--markdown-link)" },
  { tag: tags.definition(tags.variableName), color: "var(--markdown-heading)" },
]);

// ── Combined extension ───────────────────────────────────────────────────────

export const cinderTheme: Extension = [
  cinderEditorTheme,
  syntaxHighlighting(cinderHighlightStyle),
];
