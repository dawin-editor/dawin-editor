import TopNavBar from "./navbar/TopNavBar";
import { useState } from "react";
import { Button } from "../ui/button";
import { PanelTopClose, PanelTopOpen, Expand,Shrink } from "lucide-react";

const NavBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div className="navbar bg-main-blue text-primary-content shadow-sm w-[100vw]" >
      <TopNavBar isCollapsed={isCollapsed} />

      <div className="bg-white h-20 flex flex-row justify-between items-center p-6">
      <div className="flex flex-col items-start gap-1">
          <span className="font-dubai-regular text-sm text-[#6B7280]">
            عنوان المستند
          </span>
          <span className="font-dubai-regular opacity-90 text-lg text-main-blue">
            مستند بدون عنوان
          </span>
        </div>
        <div className="flex flex-row justify-between items-center gap-8 *:cursor-pointer">
          <Button
            variant="secondary"
            size="icon"
            className="size-8 bg-icons-bg hover:bg-icons-color-hover rounded-0.5"
            onClick={() => {
              if (fullScreen) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
              setFullScreen(!fullScreen);
            }}
          >
            {fullScreen ? (
              <Shrink className="size-5.5 text-icons-color" strokeWidth={2} />
            ) : (
              <Expand className="size-5.5 text-icons-color" strokeWidth={2} />
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="icon"
            className="size-8 bg-icons-bg hover:bg-icons-color-hover"
          >
            {isCollapsed ? (
              <PanelTopOpen
                className="size-5.5 text-icons-color"
                strokeWidth={2}
              />
            ) : (
              <PanelTopClose
                className="size-5.5 text-icons-color"
                strokeWidth={2}
              />
            )}
          </Button>
        </div>
       
      </div>
    </div>
  );
};

export default NavBar;
