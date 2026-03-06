/**
 * CodeMirror 6 editor component for Cinder Notes.
 *
 * Replaces the plain <textarea> with a full-featured editor:
 * - Markdown syntax highlighting (including nested code blocks)
 * - Line numbers, active line highlight, bracket matching
 * - Line wrapping, placeholder text
 * - Cinder theme integration via CSS variables
 * - Exposes EditorView ref for undo/redo from header buttons
 */

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, type ViewUpdate } from "@codemirror/view";
import { cinderTheme } from "../../../theme/cinderTheme";
import { markdownStylingPlugin } from "./markdownStylingPlugin";

import { search } from "@codemirror/search";

interface CodeMirrorEditorProps {
  /** Current file content */
  value: string;
  /** Called when content changes */
  onChange: (value: string) => void;
  /** Ref to access EditorView for undo/redo/focus */
  editorViewRef?: MutableRefObject<EditorView | null>;
  /** Called when cursor position changes */
  onCursorChange?: (line: number, col: number) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
}

const extensions = [
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
  }),
  EditorView.lineWrapping,
  markdownStylingPlugin,
  search({ top: true, caseSensitive: true }),
];

export function CodeMirrorEditor({
  value,
  onChange,
  editorViewRef,
  onCursorChange,
  placeholder = "Type your markdown here...",
}: CodeMirrorEditorProps) {
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  // Sync the EditorView ref to parent
  useEffect(() => {
    if (editorViewRef && cmRef.current?.view) {
      editorViewRef.current = cmRef.current.view;
    }
  });

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange],
  );

  const handleUpdate = useCallback(
    (viewUpdate: ViewUpdate) => {
      if (onCursorChange && viewUpdate.selectionSet) {
        const pos = viewUpdate.state.selection.main.head;
        const line = viewUpdate.state.doc.lineAt(pos);
        onCursorChange(line.number, pos - line.from + 1);
      }
    },
    [onCursorChange],
  );

  return (
    <CodeMirror
      ref={cmRef}
      className="absolute inset-0 w-full h-full text-left"
      value={value}
      height="100%"
      extensions={extensions}
      theme={cinderTheme}
      onChange={handleChange}
      onUpdate={handleUpdate}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: false,
        highlightActiveLineGutter: false,
        highlightActiveLine: true,
        bracketMatching: true,
        closeBrackets: true,
        foldGutter: false,
        indentOnInput: true,
        history: true,
        searchKeymap: true,
        drawSelection: true,
        dropCursor: true,
        crosshairCursor: false,
        rectangularSelection: true,
        highlightSelectionMatches: true,
        allowMultipleSelections: true,
        autocompletion: false,
        lintKeymap: false,
        syntaxHighlighting: true,
        defaultKeymap: true,
        historyKeymap: true,
        foldKeymap: true,
        completionKeymap: false,
      }}
    />
  );
}
