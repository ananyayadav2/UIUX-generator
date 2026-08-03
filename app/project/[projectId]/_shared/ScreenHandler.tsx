import React, { useContext, useState } from 'react';
import { Code, Camera, Sparkles, MoreVertical, Copy, Trash, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { UserDetailContext } from '@/context/UserDetailContext';
import axios from 'axios';
import domtoimage from 'dom-to-image';

export default function ScreenHandler({ screen }: { screen: any }) {
  const { userDetails } = useContext(UserDetailContext);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New states for the Edit feature
  const [isEditing, setIsEditing] = useState(false);
  const [editUserInput, setEditUserInput] = useState("");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(screen?.code || "");
    toast.success("Code copied to clipboard!");
  };

  const onDelete = async () => {
    if (!userDetails?.projectId || !screen?.screenId) {
      toast.error("Missing project or screen ID");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/api/project?projectId=${userDetails.projectId}&screenId=${screen.screenId}`);
      toast.success("Screen deleted successfully");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete screen");
      console.error(error);
      setIsDeleting(false);
    }
  };

  // New method for Editing the Screen using AI
  const onEdit = async () => {
    if (!userDetails?.projectId || !screen?.screenId) {
      toast.error("Missing project or screen ID");
      return;
    }
    if (!editUserInput.trim()) {
      toast.error("Please enter what changes you want to make.");
      return;
    }

    setIsEditing(true);
    toast.loading("Regenerating new screen, please wait...", { id: "edit-toast" });

    try {
      // Calls the new API endpoint we are about to create
      await axios.post("/api/edit-screen", {
        projectId: userDetails.projectId,
        screenId: screen.screenId,
        userInput: editUserInput,
        oldCode: screen.code,
      });

      toast.success("Screen edited successfully!", { id: "edit-toast" });
      // Reloads to fetch the updated AI UI layout
      window.location.reload(); 
    } catch (error) {
      console.error("Edit failed:", error);
      toast.error("Failed to edit screen", { id: "edit-toast" });
      setIsEditing(false);
    }
  };

  const downloadScreenshot = async () => {
    const element = document.getElementById(`screen-container-${screen?.screenId}`);
    if (!element) {
      toast.error("Couldn't find the screen to capture.");
      return;
    }

    try {
      toast.loading("Capturing screenshot...", { id: "screenshot-toast" });

      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        bgcolor: 'transparent',
      });

      const link = document.createElement('a');
      link.download = `${screen?.screenName || 'mockup'}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Screenshot saved!", { id: "screenshot-toast" });
    } catch (err) {
      console.error("Screenshot failed:", err);
      toast.error("Failed to capture screenshot", { id: "screenshot-toast" });
    }
  };

  return (
    <div className="drag-handle flex items-center justify-between w-full bg-gray-100 rounded-xl p-2 mb-2 cursor-move">
      {/* Left Side: Drag Indicator / Screen Name */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">
          || Drag Here
        </span>
        <span className="text-sm font-semibold text-gray-600 ml-2">
          {screen?.screenName || "Screen"}
        </span>
      </div>

      {/* Right Side: Toolbar Options */}
      <div className="flex items-center gap-1">

        {/* 1. View Code */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Code className="w-4 h-4 text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>HTML & Tailwind CSS Code</DialogTitle>
              <DialogDescription>
                You can copy and use this code in your own project.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto rounded-md bg-[#2f2f2f] relative mt-4">
              <Button size="sm" className="absolute top-4 right-4 z-10" onClick={handleCopyCode}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <SyntaxHighlighter language="html" style={materialDark} customStyle={{ margin: 0, padding: '20px', minHeight: '100%' }} wrapLongLines={true}>
                {screen?.code || "No code generated yet."}
              </SyntaxHighlighter>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. Screenshot Button */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadScreenshot}>
          <Camera className="w-4 h-4 text-gray-500" />
        </Button>

        {/* 3. Edit/Regenerate Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Sparkles className="w-4 h-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Edit Screen</p>
              <Textarea 
                placeholder="What changes do you want to make? (e.g. Change to dark mode, make it a grid)"
                value={editUserInput}
                onChange={(e) => setEditUserInput(e.target.value)}
                className="text-sm resize-none"
                rows={3}
              />
              <Button 
                size="sm" 
                onClick={onEdit}
                disabled={isEditing}
                className="w-full flex items-center gap-2"
              >
                {isEditing ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Regenerate
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 4. Dropdown Menu with Delete */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
              {isDeleting ? <Loader2Icon className="w-4 h-4 text-gray-500 animate-spin" /> : <MoreVertical className="w-4 h-4 text-gray-500" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600">
              <Trash className="w-4 h-4 mr-2" /> Delete Screen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}