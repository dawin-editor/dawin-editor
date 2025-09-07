import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor"
import NavBar from "./components/Editor/NavBar"
const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-20">
        <NavBar />
      </div>

      <div className="flex-1 overflow-hidden">
        <SimpleEditor/>
      </div>
    </div>
  )
}

export default Layout
