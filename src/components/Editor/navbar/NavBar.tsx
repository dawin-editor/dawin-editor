import TopNavBar from "./components/TopNavBar.tsx";
import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button.tsx";
import {
  PanelTopClose,
  PanelTopOpen,
  Expand,
  Shrink,
  TableOfContents,
} from "lucide-react";
import EyePen from "./components/EyePen.tsx";
import { db } from "@/lib/db.ts";
import { useTitleStore } from "@/store/titleStore.ts";
import { useTocStore } from "@/store/TocStore";
import { Share2 } from "lucide-react";
import { useEditorStore } from "@/store/EditroStore";
import { shareContent } from "@/lib/share";
import { toast } from "react-hot-toast";
import Toast from "./components/Toast";

const NavBar = () => {
  const { isOpen, setIsOpen } = useTocStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const { title, setTitle } = useTitleStore();
  const { editor } = useEditorStore();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    db.blogs.get(1).then((blog) => {
      if (blog?.title) setTitle(blog.title);
    });
  }, [setTitle]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    db.blogs.update(1, { title: newTitle });
  };

  const handleShare = async () => {
    const content = (
      editor?.storage as {
        markdown?: { getMarkdown: () => string };
      }
    )?.markdown?.getMarkdown?.() || "";

    if (!content) {
      toast.error("لا يوجد محتوى للمشاركة!");
      return;
    }

    setIsSharing(true);
    try {
      const jsonContent = editor?.getJSON();
      if (!jsonContent) {
        toast.error("لا يوجد محتوى للمشاركة!");
        return;
      }
      const url = await shareContent(jsonContent);
      await navigator.clipboard.writeText(url);
      toast.success("تم إنشاء الرابط ونسخه!");
    } catch (error) {
      toast.error("فشل في المشاركة.");
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full bg-main-blue text-primary-content" dir="rtl">
      <TopNavBar isCollapsed={isCollapsed} />

      <div className="bg-white h-20 flex flex-row justify-between items-center px-4 sm:px-8 py-4 border-b-1 w-full">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <span className="font-dubai-regular text-sm opacity-65 text-[#6B7280]">
            عنوان المستند
          </span>
          <input
            className="opacity-90 text-main-blue border-none outline-none w-full max-w-[200px] sm:max-w-none"
            style={{ fontSize: "1.125rem", fontFamily: "Dubai-regular" }}
            value={title}
            onChange={handleTitleChange}
            placeholder="مستند بدون عنوان"
          />
        </div>
        <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 *:cursor-pointer flex-shrink-0">
          <Button
            variant="secondary"
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            className="size-8 bg-icons-bg hover:bg-icons-color-hover rounded-0.5 flex md:hidden"
          >
            <TableOfContents
              className="size-5.5 text-icons-color"
              strokeWidth={2}
            />
          </Button>


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
          <Button
            variant="secondary"
            onClick={handleShare}
            size="icon"
            className={`size-8 bg-icons-bg hover:bg-icons-color-hover rounded-0.5 flex md:hidden ${isSharing ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Share2
              className={`size-5.5 text-icons-color ${isSharing ? "animate-pulse" : ""}`}
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default NavBar;
