import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { FileExplorer } from './components/layout/explorer/FileExplorer'
import { EditorPane } from './components/layout/editor/EditorPane'

function App() {
  return (
    <MainLayout
      sidebarContent={<FileExplorer />}
      editorContent={<EditorPane />}
    />
  )
}

export default App
