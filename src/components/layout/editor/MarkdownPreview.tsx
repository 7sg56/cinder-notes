import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { processMarkdown } from '../../../util/markdownpipeline';

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
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSanitize]}
            >
                {processed}
            </ReactMarkdown>
        </div>
    );
}
