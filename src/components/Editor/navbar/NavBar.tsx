import TopNavBar from "./components/TopNavBar.tsx";
import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button.tsx";
import { PanelTopClose, PanelTopOpen, Expand, Shrink } from "lucide-react";
import EyePen from "./components/EyePen.tsx";
import { db } from "@/lib/db.ts";

const NavBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  
  useEffect(() => {
    db.blogs.get(1).then((blog) => {
      if (blog?.title) setDocumentTitle(blog.title);
    });
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setDocumentTitle(newTitle);
    db.blogs.update(1, { title: newTitle });
  };

  return (
    <div
      className="w-full bg-main-blue text-primary-content"
      dir="rtl"
    >
      <TopNavBar isCollapsed={isCollapsed} />

      <div className="bg-white h-20 flex flex-row justify-between items-center px-4 sm:px-8 py-4 border-b-1 w-full">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <span className="font-dubai-regular text-sm opacity-65 text-[#6B7280]">
            عنوان المستند
          </span>
          <input
            className="opacity-90 text-main-blue border-none outline-none w-full max-w-[200px] sm:max-w-none"
            style={{ fontSize: "1.125rem", fontFamily: "Dubai-regular" }}
            value={documentTitle}
            onChange={handleTitleChange}
            placeholder="مستند بدون عنوان"
          />
        </div>
        <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 *:cursor-pointer flex-shrink-0">
          <EyePen
            className="size-8 bg-icons-bg hover:bg-icons-color-hover "
            variant="secondary"
            size="icon"
            IconsStyle="size-5.5 text-icons-color"
            IconsStroke={2}
          />
          <Button
            variant="secondary"
            size="icon"
            className="size-8 bg-icons-bg hover:bg-icons-color-hover rounded-0.5 hidden md:flex"
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
          {/* ******************************************* */}
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
