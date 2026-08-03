"use client";
import { themeToCssVars, THEMES } from '@/data/Themes';
import { ProjectType } from '@/type/type';
import React, { useState } from 'react';
import { Code, Copy } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

interface ScreenFrameProps {
  screen: any;
  x: number;
  y: number;
  width: number;
  height: number;
  setPanningEnable: (enable: boolean) => void;
  projectDetail: ProjectType | undefined;
  selectedTheme: string;
}

export default function ScreenFrame({ screen, x, y, width, height, setPanningEnable, projectDetail, selectedTheme }: ScreenFrameProps) {
  const [size, setSize] = useState({ width, height });

  const currentTheme = selectedTheme || projectDetail?.theme;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(screen?.code || '');
    toast.success('Code copied to clipboard!');
  };
  const theme = THEMES[currentTheme as keyof typeof THEMES] || THEMES.AURORA_INK;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
    <style>
    ${themeToCssVars(theme)}
    </style>
    </head>
    <body class="bg-[var(--background)] text-[var(--foreground)] w-full">
    ${screen.code ?? ""}
    </body>
    </html>
  `;

  return (
    <Rnd
      default={{
        x: x,
        y: y,
        width: size.width,
        height: size.height,
      }}
      minWidth={200}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="drag-handle"
      enableResizing={{
        bottom: true,
        bottomRight: true,
        right: true,
      }}
      onDragStart={() => setPanningEnable(false)}
      onDragStop={() => setPanningEnable(true)}
      onResizeStart={() => setPanningEnable(false)}
      onResizeStop={(e, direction, ref, delta, position) => {
        setPanningEnable(true);
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
    >
      <div className="bg-white rounded-2xl p-4 shadow-xl border w-full h-full flex flex-col">
        <div className="drag-handle bg-gray-100 rounded-xl p-2 mb-2 cursor-move flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">
            {screen.screenName || "Screen"}
          </span>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
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
                <SyntaxHighlighter
                  language="html"
                  style={materialDark}
                  customStyle={{ margin: 0, padding: '20px', minHeight: '100%' }}
                  wrapLongLines={true}
                >
                  {screen?.code || 'No code generated yet.'}
                </SyntaxHighlighter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 border relative">
          <iframe
            key={`${screen.screenId}-${currentTheme}`}
            srcDoc={html}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </Rnd>
  );
}