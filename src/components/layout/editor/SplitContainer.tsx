import type { SplitNode } from '../../../store/useSplitStore';
import { EditorPane } from './EditorPane';
import { SplitResizeHandle } from './SplitResizeHandle';

interface SplitContainerProps {
  node: SplitNode;
  path?: number[];
}

export function SplitContainer({ node, path = [] }: SplitContainerProps) {
  if (node.type === 'leaf') {
    return <EditorPane paneId={node.paneId} />;
  }

  const isHorizontal = node.axis === 'horizontal';

  return (
    <div
      className="split-container"
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {node.children.map((child, i) => (
        <SplitChild
          key={getChildKey(child)}
          child={child}
          flex={node.flexes[i]}
          index={i}
          total={node.children.length}
          axis={node.axis}
          parentPath={path}
        />
      ))}
    </div>
  );
}

// Separate component to avoid key issues with fragments
interface SplitChildProps {
  child: SplitNode;
  flex: number;
  index: number;
  total: number;
  axis: 'horizontal' | 'vertical';
  parentPath: number[];
}

function SplitChild({
  child,
  flex,
  index,
  total,
  axis,
  parentPath,
}: SplitChildProps) {
  const isHorizontal = axis === 'horizontal';
  const childPath = [...parentPath, index];

  return (
    <>
      <div
        className="split-pane-wrapper"
        style={{
          flex: flex,
          minWidth: isHorizontal ? '200px' : undefined,
          minHeight: !isHorizontal ? '150px' : undefined,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SplitContainer node={child} path={childPath} />
      </div>
      {index < total - 1 && (
        <SplitResizeHandle
          axis={axis}
          branchPath={parentPath}
          childIndex={index}
        />
      )}
    </>
  );
}

/** Get a stable key for a child node */
function getChildKey(node: SplitNode): string {
  if (node.type === 'leaf') return node.paneId;
  // For branches, use a composite of child keys
  return `branch-${node.children.map(getChildKey).join('-')}`;
}
