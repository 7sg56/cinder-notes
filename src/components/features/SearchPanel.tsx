import { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore, type SearchResult } from "../../store/useAppStore";
import { Search, FileText, X } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
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
        const results = await invoke<SearchResult[]>("search_workspace", {
          path: workspacePath,
          query: query.trim(),
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [workspacePath, setSearchResults],
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
            placeholder="Search workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setSearchOpen(false);
              }
            }}
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-[#1e90ff] border-t-transparent rounded-full animate-spin ml-3"></div>
          )}
          <button
            className="p-1 hover:bg-white/10 rounded ml-2"
            onClick={() => setSearchOpen(false)}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2 space-y-1">
              {searchResults.map((result, i) => (
                <button
                  key={`${result.file_path}-${result.line_number}-${i}`}
                  className="w-full flex items-start text-left p-3 hover:bg-white/5 rounded-lg group transition-colors"
                  onClick={() => {
                    selectFile(result.file_path);
                    setSearchOpen(false);
                  }}
                >
                  <FileText className="w-4 h-4 text-gray-400 mt-1 mr-3 group-hover:text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {result.file_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Line {result.line_number}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {result.content_preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim().length > 0 && !isLoading ? (
            <div className="p-8 text-center text-gray-500">
              No results found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
