import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor";
import NavBar from "./components/Editor/NavBar";
import Stat from "./components/Editor/Stat";

const Layout = () => {
  return (
    <div className="flex h-full flex-col bg-gray-50 mobile-layout">
      <div className="sticky top-0 z-50 ">
        <NavBar />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white mobile-content">
        <SimpleEditor />
      </div>

      <footer
        className="w-screen h-6 bg-yello-bg border-t-2 border-yello-border pt-[2.2px] px-2 sm:px-7 "
        dir="rtl"
      >
        <Stat />
      </footer>
    </div>
  );
};

export default Layout;
