import "./App.css";
import { MainLayout } from "./components/layout/MainLayout";
import { FileExplorer } from "./components/layout/explorer/FileExplorer";
import { EditorPane } from "./components/layout/editor/EditorPane";
import { FloatingHub } from "./components/features/FloatingHub";
import { SearchPanel } from "./components/features/SearchPanel";
import { WorkspaceWelcome } from "./components/onboarding/WorkspaceWelcome";
import { useAppStore } from "./store/useAppStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useFileWatcher } from "./hooks/useFileWatcher";

function App() {
  const workspacePath = useAppStore((state) => state.workspacePath);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  // Watch workspace directory for external file changes
  useFileWatcher();

  // Show workspace selection if no workspace is set
  if (!workspacePath) {
    return <WorkspaceWelcome />;
  }

  return (
    <>
      <MainLayout
        sidebarContent={<FileExplorer />}
        editorContent={<EditorPane />}
      />
      <FloatingHub />
      <SearchPanel />
    </>
  );
}

export default App;
