import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore, type SearchResult } from '../../store/useAppStore';
import { Search, FileText, X } from 'lucide-react';

export function SearchPanel() {
  const {
    isSearchOpen,
    searchQuery,
    searchResults,
    workspacePath,
    setSearchOpen,
    setSearchQuery,
    setSearchResults,
    selectFile,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setHoveredIndex(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle actual search backend call
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !workspacePath) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await invoke<SearchResult[]>('search_workspace', {
          path: workspacePath,
          query: query.trim(),
        });
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [workspacePath, setSearchResults]
  );

  // Debounce user input
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  if (!isSearchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-primary)',
            gap: '10px',
          }}
        >
          <Search
            style={{
              width: 18,
              height: 18,
              color: 'var(--text-tertiary)',
              flexShrink: 0,
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setSearchOpen(false);
              }
            }}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
          />
          {isLoading && (
            <div
              style={{
                width: 16,
                height: 16,
                border: '2px solid var(--editor-header-accent)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                flexShrink: 0,
              }}
            />
          )}
          <button
            onClick={() => setSearchOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {searchResults.length > 0 ? (
            <div style={{ padding: '6px' }}>
              {searchResults.map((result, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <button
                    key={`${result.file_path}-${i}`}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      gap: '10px',
                      backgroundColor: isHovered
                        ? 'var(--bg-hover)'
                        : 'transparent',
                      borderLeft: isHovered
                        ? '3px solid var(--editor-header-accent)'
                        : '3px solid transparent',
                      transition: 'all 0.12s ease',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => {
                      selectFile(result.file_path);
                      setSearchOpen(false);
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <FileText
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        color: isHovered
                          ? 'var(--editor-header-accent)'
                          : 'var(--text-tertiary)',
                        transition: 'color 0.12s ease',
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: isHovered
                            ? 'var(--text-primary)'
                            : 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transition: 'color 0.12s ease',
                        }}
                      >
                        {result.file_name}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {result.content_preview}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : searchQuery.trim().length > 0 && !isLoading ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '13px',
              }}
            >
              No files found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
