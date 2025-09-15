import NavBar from "./components/Editor/NavBar";
import Stat from "./components/Editor/Stat";
import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor";

const Layout = () => {
  return (
    <div
      className="flex h-full flex-col bg-gray-50 mobile-layout transition-opacity duration-500"
    >
      <div className="sticky top-0 z-50 ">
        <NavBar />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-white mobile-content">
        <SimpleEditor />
      </div>

      <footer
        className="w-screen h-6 bottom-0 z-50 bg-yello-bg border-t-2 border-yello-border pt-[2.2px] px-2 sm:px-8 "
        dir="rtl"
      >
        <Stat />
      </footer>
    </div>
  );
};

export default Layout;
