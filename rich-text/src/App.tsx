import { useState } from 'react'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import './styles/editor.css'
import './styles/document.css'
import './styles/sidebar.css'

function App() {
  const [activeNav, setActiveNav] = useState<string>('home')

  return (
    <div className="app-layout">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <main className="app-main">
        <Editor />
      </main>
    </div>
  )
}

export default App
