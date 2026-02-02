import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { FileExplorer } from './components/layout/explorer/FileExplorer'
import { EditorPane } from './components/layout/editor/EditorPane'
import { FloatingHub } from './components/features/FloatingHub'

function App() {
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

