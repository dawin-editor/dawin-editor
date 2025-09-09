import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor"
import NavBar from "./components/Editor/NavBar"
const Layout = () => {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <div className="sticky top-0 z-50 ">
        <NavBar />
      </div>

      <div className="min-h-0 flex-1 overflow-visible bg-white ">
        <SimpleEditor/>
      </div>

      <footer className="w-screen h-6 bg-yello-bg border-t-2 border-yello-border">

      </footer>
    </div>
  )
}

export default Layout
