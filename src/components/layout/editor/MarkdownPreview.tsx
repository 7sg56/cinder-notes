import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { processMarkdown } from '../../../util/markdownpipeline';
import { isValidElement } from 'react';

// CSS imports
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../../../theme/markdown.css';

/**
 * Custom sanitization schema that preserves math-related classes through
 * the sanitizer so rehype-katex (which runs AFTER sanitize) can find and
 * render them.
 *
 * Per the official rehype-katex docs, the correct order is:
 *   rehypeSanitize -> rehypeKatex
 * NOT:
 *   rehypeKatex -> rehypeSanitize (which strips KaTeX's HTML output)
 *
 * @see https://github.com/remarkjs/remark-math/blob/main/packages/rehype-katex/readme.md
 */
const mathSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Allow math-related classes on code elements so rehype-katex can process them.
    // The `language-*` regex is allowed by default for syntax highlighting.
    code: [['className', /^language-./, 'math-inline', 'math-display']],
  },
};

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const processed = processMarkdown(content);

  return (
    <div className="flex-1 w-full h-full overflow-y-auto">
      <div className="markdown-preview px-8 sm:px-12 py-10">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[
            rehypeHighlight,
            [rehypeSanitize, mathSanitizeSchema],
            rehypeKatex,
          ]}
          components={{
            pre({ children }) {
              const childArray = Array.isArray(children)
                ? children
                : [children];
              const codeElement = childArray.find((child) =>
                isValidElement(child)
              );
              const props = (
                isValidElement(codeElement) ? codeElement.props : {}
              ) as { className?: string };
              const className = props.className ?? '';
              const match = /language-([A-Za-z0-9_-]+)/.exec(className);
              const language = match?.[1] ?? 'plaintext';

              return (
                <div className="code-block">
                  <div className="code-block-header">
                    <span className="code-block-lang">{language}</span>
                  </div>
                  <pre>{children}</pre>
                </div>
              );
            },
          }}
        >
          {processed}
        </ReactMarkdown>
      </div>
    </div>
  );
}
