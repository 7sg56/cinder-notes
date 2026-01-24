import './App.css'
import { MainLayout } from './components/layout/MainLayout'
import { FileExplorer } from './components/layout/explorer/FileExplorer'
import { Editor } from './components/layout/editor/Editor'

function App() {
  return (
    <MainLayout
      sidebarContent={<FileExplorer />}
      editorContent={<Editor />}
    />
  )
}

export default App
