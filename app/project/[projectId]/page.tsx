"use client";
import React, { useEffect, useState } from 'react';
import ProjectHeader from './_shared/ProjectHeader';
import SettingsSection from './_shared/SettingsSection';
import Canvas from './_shared/canvas';
import axios from 'axios';
import domtoimage from 'dom-to-image';
import { useParams } from 'next/navigation';
import { ProjectType, ScreenConfig } from '@/type/type';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectPage() {
  const { projectId } = useParams() as { projectId: string };

  const [projectDetail, setProjectDetail] = useState<ProjectType | undefined>();
  const [screenConfig, setScreenConfig] = useState<ScreenConfig[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('AURORA_INK');
  const [projectName, setProjectName] = useState<string>('');
  const [userNewScreenInput, setUserNewScreenInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMsg, setLoadingMsg] = useState<string>('Loading...');
  const [saving, setSaving] = useState<boolean>(false);
  const [generatingNewScreen, setGeneratingNewScreen] = useState<boolean>(false);

  const generateScreenUIUX = async (screens: any[], append = false) => {
    setLoading(true);

    if (!screens?.length) {
      setLoading(false);
      return;
    }

    const normalizedScreens = screens.map((screen) => ({
      ...screen,
      screenId: screen.screenId || screen.id,
      screenName: screen.screenName || screen.name,
      screenDescription: screen.screenDescription || screen.layoutDescription,
      code: screen.code || ''
    }));

    setScreenConfig((prev) => (append ? [...prev, ...normalizedScreens] : normalizedScreens));

    for (let index = 0; index < normalizedScreens.length; index++) {
      const screen = normalizedScreens[index];

      if (screen.code) {
        continue;
      }

      setLoadingMsg(`Generating screen ${index + 1} of ${normalizedScreens.length}...`);

      try {
        const result = await axios.post('/api/generate-screen-ui', {
          projectId: projectId,
          screenId: screen.screenId || screen.id,
          screenName: screen.screenName || screen.name,
          purpose: screen.purpose,
          screenDescription: screen.screenDescription || screen.layoutDescription,
          userInput: screen.purpose || `Generate a polished UI for ${screen.screenName || screen.name || 'this screen'}`,
          oldCode: screen.code || ''
        });

        const generatedCode = result.data?.code || result.data?.result?.[0]?.code || '';

        setScreenConfig((prev) =>
          prev.map((item) =>
            (item.screenId || item.id) === (screen.screenId || screen.id)
              ? { ...item, code: generatedCode }
              : item
          )
        );
      } catch (e) {
        console.error("Error generating screen UI:", e);
      }
    }
    setLoading(false);
  };

  const generateScreenConfig = async (detail: ProjectType) => {
    setLoadingMsg('Generating Screen Config...');
    setLoading(true);
    try {
      const result = await axios.post('/api/generate-config', {
        projectId: projectId,
        deviceType: detail?.device || 'desktop',
        userInput: detail?.userInput || 'Generate a standard dashboard layout'
      });

      setScreenConfig(result.data.screens);
      setProjectDetail((prev: any) => ({
        ...prev,
        projectName: result.data.projectName,
        projectVisualDescription: result.data.projectVisualDescription,
        theme: result.data.theme
      }));

      generateScreenUIUX(result.data.screens);

    } catch (e) {
      console.error("Generation error:", e);
      setLoading(false);
    } 
  };

  const GetProjectDetails = async () => {
    setLoading(true);
    setLoadingMsg('Loading project...');
    try {
      const result = await axios.get('/api/project?projectId=' + projectId);
      const data = result.data;

      const screenList = data.screenConfig || data.screenconfig || [];

      setProjectDetail(data.projectDetail);
      setScreenConfig(screenList);

      if (!screenList || screenList.length === 0) {
        await generateScreenConfig(data.projectDetail);
      } else {
        generateScreenUIUX(screenList);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectDetail?.theme) {
      setSelectedTheme(projectDetail.theme);
    }
    if (projectDetail?.projectName || projectDetail?.name) {
      setProjectName(projectDetail.projectName || projectDetail.name || '');
    }
  }, [projectDetail?.theme, projectDetail?.projectName, projectDetail?.name]);

  useEffect(() => {
    if (projectId) {
      GetProjectDetails();
    }
  }, [projectId]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setProjectDetail((prev) => prev ? { ...prev, theme } : prev);
  };

  const handleSaveProject = async () => {
    if (!projectId) {
      toast.error('Unable to save project without a valid project ID.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.patch('/api/project', {
        projectId,
        projectName: projectName || projectDetail?.projectName || projectDetail?.name || 'Untitled Project',
        theme: selectedTheme,
      });

      const updatedProject = response.data.project;
      setProjectDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          name: updatedProject?.name || projectName,
          projectName: updatedProject?.name || projectName,
          theme: updatedProject?.theme || selectedTheme,
        };
      });
      toast.success('Project saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNewScreen = async () => {
    if (!projectId) {
      toast.error('Unable to generate a screen without a valid project ID.');
      return;
    }
    if (!userNewScreenInput.trim()) {
      toast.error('Please enter a prompt to generate a new screen.');
      return;
    }

    setGeneratingNewScreen(true);
    setLoadingMsg('Generating a new screen...');
    setLoading(true);

    try {
      const response = await axios.post('/api/add-screen', {
        projectId,
        prompt: userNewScreenInput,
      });

      const newScreen = response.data.screen;
      if (!newScreen) {
        throw new Error('No screen returned from add-screen endpoint.');
      }

      setUserNewScreenInput('');
      await generateScreenUIUX([newScreen], true);
      toast.success('New screen generated successfully.');
    } catch (error) {
      console.error('Generate new screen failed:', error);
      toast.error('Failed to generate new screen.');
    } finally {
      setGeneratingNewScreen(false);
      setLoading(false);
    }
  };

  const handleScreenshot = async () => {
    const element = document.getElementById('project-design-canvas');
    if (!element) {
      toast.error('Could not find the canvas to capture.');
      return;
    }

    try {
      toast.loading('Capturing screenshot...', { id: 'settings-screenshot' });
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1,
        bgcolor: 'transparent',
      });

      const link = document.createElement('a');
      link.download = `${projectName || 'uiux-mock'}-canvas.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Screenshot saved!', { id: 'settings-screenshot' });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast.error('Failed to capture screenshot.', { id: 'settings-screenshot' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: projectName || projectDetail?.projectName || 'UIUX Mock',
      text: 'Check out this generated UI mockup project.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard.');
      } else {
        toast.error('Share is not supported in this browser.');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share URL.');
    }
  };

  return (
    <div>
      <ProjectHeader onSave={handleSaveProject} saving={saving} />
      <div className="relative">
        {loading && (
          <div className="p-3 absolute bg-blue-300/20 border-b-blue-600 rounded-xl left-1/2 top-20 z-50">
            <h2 className="flex gap-2 items-center">
              <Loader2Icon className="animate-spin" /> {loadingMsg}
            </h2>
          </div>
        )}
        
        {/* Main Content Layout */}
        <div className="flex w-full">
          {!loading && (
            <SettingsSection
              selectedTheme={selectedTheme}
              onThemeChange={handleThemeChange}
              projectName={projectName}
              onProjectNameChange={setProjectName}
              userNewScreenInput={userNewScreenInput}
              onUserNewScreenInputChange={setUserNewScreenInput}
              onGenerateNewScreen={handleGenerateNewScreen}
              isGeneratingNewScreen={generatingNewScreen}
              onScreenshot={handleScreenshot}
              onShare={handleShare}
            />
          )}
          
          {/* Canvas Section */}
          <div className="flex-1">
            {!loading && screenConfig.length > 0 && (
              <Canvas projectDetail={projectDetail} screenConfig={screenConfig} selectedTheme={selectedTheme} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}