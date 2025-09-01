import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Preview from "./content/Preview";
import Editing from "./content/Editing";


const Content = () => {
  return (
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <Preview  />
        <ResizableHandle
          withHandle
          className="bg-[#bad7f0] "
        />
        <Editing />
      </ResizablePanelGroup>
  );
};

export default Content;
