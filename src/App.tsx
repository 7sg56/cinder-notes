import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { FileExplorer } from './components/layout/explorer/FileExplorer'
import { EditorPane } from './components/layout/editor/EditorPane'
import { FloatingHub } from './components/features/FloatingHub'
import { WorkspaceWelcome } from './components/onboarding/WorkspaceWelcome'
import { useAppStore } from './store/useAppStore'

function App() {
  const workspacePath = useAppStore((state) => state.workspacePath);

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
    </>
  )
}

export default App
