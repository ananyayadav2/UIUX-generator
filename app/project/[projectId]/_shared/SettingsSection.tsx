"use client";
import React from 'react';
import { THEME_NAME_LIST, THEMES } from '@/data/Themes';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SettingsSectionProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  userNewScreenInput: string;
  onUserNewScreenInputChange: (value: string) => void;
  onGenerateNewScreen: () => void;
  onScreenshot: () => void;
  onShare: () => void;
  isGeneratingNewScreen: boolean;
}

function SettingsSection({
  selectedTheme,
  onThemeChange,
  projectName,
  onProjectNameChange,
  userNewScreenInput,
  onUserNewScreenInputChange,
  onGenerateNewScreen,
  onScreenshot,
  onShare,
  isGeneratingNewScreen,
}: SettingsSectionProps) {
  return (
    <div className='p-5 w-[300px] h-[90vh] border-r'>
      <h2 className='font-medium text-lg'>Settings</h2>

      <div className='mt-3'>
        <h2 className='text-sm mb-1'>Project Name</h2>
        <Input
          placeholder='Project Name'
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
        />
      </div>

      <div className='mt-5'>
        <h2 className='text-sm mb-1'>Generate New Screen</h2>
        <Textarea
          placeholder='Enter Prompt to Generate screen using AI'
          value={userNewScreenInput}
          onChange={(event) => onUserNewScreenInputChange(event.target.value)}
          rows={4}
        />
        <Button
          size='sm'
          className='mt-2 w-full'
          onClick={onGenerateNewScreen}
          disabled={isGeneratingNewScreen}
        >
          <Sparkles className='mr-2' />
          {isGeneratingNewScreen ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      <div className='mt-5'>
        <h2 className='text-sm mb-1'>Themes</h2>
        <div className='h-[200px] overflow-auto'>
          {THEME_NAME_LIST.map((theme, index) => (
            <div
              key={index}
              className={`p-3 border rounded-xl mb-2 cursor-pointer ${theme === selectedTheme ? 'border-primary bg-primary/20' : ''}`}
              onClick={() => onThemeChange(theme)}
            >
              <h2 className="font-semibold">{theme}</h2>
              <div className='flex gap-2 mt-2'>
                <div className='h-4 w-4 rounded-full' style={{ background: THEMES[theme].primary }} />
                <div className='h-4 w-4 rounded-full' style={{ background: THEMES[theme].secondary }} />
                <div className='h-4 w-4 rounded-full' style={{ background: THEMES[theme].accent }} />
                <div className='h-4 w-4 rounded-full' style={{ background: THEMES[theme].background }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div className='mt-5'>
        <h2 className='text-sm mb-1'>Extras</h2>
        <div className='flex gap-3'>
          <Button size='sm' variant='outline' className='mt-2' onClick={onScreenshot}>
            <Camera className='mr-2' /> Screenshot
          </Button>
          <Button size='sm' variant='outline' className='mt-2' onClick={onShare}>
            <Share className='mr-2' /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;