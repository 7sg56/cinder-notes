import { useCallback, useRef, useState } from 'react';
import { useSplitStore } from '../../../store/useSplitStore';

interface SplitResizeHandleProps {
  axis: 'horizontal' | 'vertical';
  branchPath: number[];
  childIndex: number;
}

export function SplitResizeHandle({
  axis,
  branchPath,
  childIndex,
}: SplitResizeHandleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      useSplitStore.getState().setIsResizing(true);

      // Track last position for incremental deltas (not absolute from start)
      let lastPos = axis === 'horizontal' ? e.clientX : e.clientY;

      // Get the parent container to calculate relative positions
      const handle = containerRef.current;
      if (!handle) return;
      const parent = handle.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const parentSize =
        axis === 'horizontal' ? parentRect.width : parentRect.height;

      document.body.style.cursor =
        axis === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos =
          axis === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
        const deltaPx = currentPos - lastPos;
        lastPos = currentPos;
        const deltaRatio = deltaPx / parentSize;

        useSplitStore
          .getState()
          .setSplitRatio(branchPath, childIndex, deltaRatio);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        useSplitStore.getState().setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [axis, branchPath, childIndex]
  );

  const handleDoubleClick = useCallback(() => {
    useSplitStore.getState().resetFlexes(branchPath);
  }, [branchPath]);

  const isActive = isHovered || isDragging;

  return (
    <div
      ref={containerRef}
      className="split-resize-handle"
      data-testid="split-resize-handle"
      style={{
        position: 'relative',
        flexShrink: 0,
        [axis === 'horizontal' ? 'width' : 'height']: '4px',
        [axis === 'horizontal' ? 'height' : 'width']: '100%',
        cursor: axis === 'horizontal' ? 'col-resize' : 'row-resize',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visible line */}
      <div
        style={{
          position: 'absolute',
          [axis === 'horizontal' ? 'width' : 'height']: isActive
            ? '2px'
            : '1px',
          [axis === 'horizontal' ? 'height' : 'width']: '100%',
          backgroundColor: isActive
            ? 'var(--editor-header-accent)'
            : 'var(--separator)',
          transition:
            'background-color 150ms ease, width 150ms ease, height 150ms ease',
          borderRadius: '1px',
        }}
      />
    </div>
  );
}
