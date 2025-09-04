import {
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Preview from "./content/Preview";
import Editing from "./content/Editing";
import { useMediaQuery } from "usehooks-ts";

const Content = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)"); // md breakpoint
  return (
    <ResizablePanelGroup
      direction={isDesktop ? "horizontal" : "vertical"}
      className="flex-1"
    >
      <Editing />
      <ResizableHandle withHandle className="bg-[#bad7f0] " />
      <Preview />
    </ResizablePanelGroup>
  );
};

export default Content;
