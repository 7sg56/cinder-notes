import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { processMarkdown } from '../../../util/markdownpipeline';
import { isValidElement } from 'react';

// CSS imports
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import '../../../theme/markdown.css';

interface MarkdownPreviewProps {
    content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
    const processed = processMarkdown(content);

    return (
        <div className="markdown-preview flex-1 w-full h-full px-12 py-10 overflow-y-auto">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                    pre({ children }) {
                        const childArray = Array.isArray(children) ? children : [children];
                        const codeElement = childArray.find((child) => isValidElement(child));
                        const className = isValidElement(codeElement) ? codeElement.props?.className : '';
                        const match = typeof className === 'string' ? /language-([A-Za-z0-9_-]+)/.exec(className) : null;
                        const language = match?.[1] ?? 'plaintext';

                        return (
                            <div className="code-block">
                                <div className="code-block-header">
                                    <span className="code-block-lang">{language}</span>
                                </div>
                                <pre>{children}</pre>
                            </div>
                        );
                    }
                }}
            >
                {processed}
            </ReactMarkdown>
        </div>
    );
}
