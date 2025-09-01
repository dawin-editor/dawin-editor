import TopNavBar from "./navbar/TopNavBar";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import {  PanelTopClose, PanelTopOpen, Expand } from "lucide-react";

const NavBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="navbar bg-red-500 text-primary-content shadow-sm  ">
      <TopNavBar isCollapsed={isCollapsed} />

      <div className="bg-white h-20 flex flex-row justify-between items-center p-4">
        <div className="flex flex-row justify-between items-center gap-2 *:cursor-pointer">
          <Button variant="secondary" size="icon" className="size-9" onClick={() => {
            
            setFullScreen(!fullScreen);
          }}>
            <Expand />
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCollapsed(!isCollapsed)}
            size="icon"
            className="size-9"
          >
            {isCollapsed ? (
              <PanelTopOpen style={{ width: "20px", height: "20px" }} />
            ) : (
              <PanelTopClose size={16} />
            )}
          </Button>
        </div>
        <div className="flex flex-col items-end">
          <span>عنوان المستند</span>
          <span>مستند بدون عنوان</span>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
