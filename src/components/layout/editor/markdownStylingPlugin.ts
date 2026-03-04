import {
  ViewPlugin,
  Decoration,
  EditorView,
  ViewUpdate,
  type DecorationSet,
} from "@codemirror/view";
import { RangeSet } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";

/**
 * A CodeMirror ViewPlugin that adds css classes to markdown structural elements.
 */
export const markdownStylingPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDeco(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDeco(update.view);
      }
    }

    buildDeco(view: EditorView) {
      const lineClasses: { [pos: number]: string } = {};
      const decos: { from: number; to: number; deco: Decoration }[] = [];

      for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
          from,
          to,
          enter: (node) => {
            const name = node.name;

            // Marks to dim
            if (
              name.includes("Mark") ||
              name === "HeaderMark" ||
              name === "QuoteMark" ||
              name === "ListMark"
            ) {
              decos.push({
                from: node.from,
                to: node.to,
                deco: Decoration.mark({ class: "cm-md-mark" }),
              });
            }

            // Inline Code
            if (name === "InlineCode") {
              decos.push({
                from: node.from,
                to: node.to,
                deco: Decoration.mark({ class: "cm-md-inline-code" }),
              });
            }

            // Block structuring
            let cls = "";
            if (name === "FencedCode" || name === "CodeBlock")
              cls = "cm-codeblock-line";
            else if (name.includes("Heading")) {
              const match = name.match(/\d/);
              const level = match ? parseInt(match[0]) : 1;
              cls = `cm-heading-line cm-h${level}`;
            } else if (name === "Blockquote") cls = "cm-blockquote-line";
            else if (name === "Paragraph") cls = "cm-paragraph-line";

            if (cls) {
              let pos = node.from;
              while (pos <= node.to) {
                const line = view.state.doc.lineAt(pos);
                if (!lineClasses[line.from]) lineClasses[line.from] = "";
                if (!lineClasses[line.from].includes(cls)) {
                  lineClasses[line.from] += " " + cls;
                }
                if (line.to >= node.to) break;
                pos = line.to + 1;
              }
            }
          },
        });
      }

      // Add line decorations
      for (const posStr in lineClasses) {
        const pos = parseInt(posStr);
        const cls = lineClasses[posStr].trim();
        if (cls) {
          decos.push({
            from: pos,
            to: pos,
            deco: Decoration.line({ class: cls }),
          });
        }
      }

      // Sort decorations properly for RangeSet
      decos.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        // Line decorations (to == from) before marks
        if (a.to === a.from && b.to !== b.from) return -1;
        if (b.to === b.from && a.to !== a.from) return 1;
        return b.to - a.to;
      });

      return RangeSet.of(
        decos.map((d) => d.deco.range(d.from, d.to)),
        true,
      );
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
