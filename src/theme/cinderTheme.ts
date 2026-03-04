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

const cinderEditorTheme = EditorView.theme({}, { dark: true });

// ── Syntax highlighting (markdown tokens) ────────────────────────────────────

const cinderHighlightStyle = HighlightStyle.define([
  // Headings (Matching preview sizes and weight)
  {
    tag: tags.heading1,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.9em",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading2,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.45em",
    letterSpacing: "-0.02em",
    lineHeight: "1.3",
  },
  {
    tag: tags.heading3,
    color: "var(--markdown-heading)",
    fontWeight: "650",
    fontSize: "1.25em",
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
