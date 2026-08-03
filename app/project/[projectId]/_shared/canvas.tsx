"use client";
import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ScreenFrame from './ScreenFrame';

interface CanvasProps {
  projectDetail: any;
  screenConfig: any[];
  selectedTheme: string;
}

export default function Canvas({ projectDetail, screenConfig, selectedTheme }: CanvasProps) {
  const [panningEnable, setPanningEnable] = useState(true);

  const isMobile = projectDetail?.device === 'mobile';
  
  const screenWidth = isMobile ? 400 : 1000;
  const screenHeight = 800;
  const gap = 50;

  return (
    <div id="project-design-canvas" className="w-full h-[90vh] bg-gray-100 relative overflow-hidden">
      <TransformWrapper
        initialScale={0.7}
        minScale={0.3}
        maxScale={3}
        panning={{ disabled: !panningEnable }}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div 
            className="w-full h-full relative"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {screenConfig.map((screen, index) => {
              const xPos = index * (screenWidth + gap) + 50;

              return (
                <ScreenFrame
                  key={index}
                  screen={screen}
                  x={xPos}
                  y={50}
                  width={screenWidth}
                  height={screenHeight}
                  setPanningEnable={setPanningEnable}
                  projectDetail={projectDetail}
                  selectedTheme={selectedTheme}
                />
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}