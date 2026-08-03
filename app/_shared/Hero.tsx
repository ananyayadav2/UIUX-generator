"use client";
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ChevronRight, Loader, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { suggestions } from '@/data/constant';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { randomUUID } from 'crypto';
import axios from 'axios';

function Hero() {

const [userInput, setUserInput] = useState<string>()
const [device, setDevice] = useState<string>('Website')
const {user} = useUser();
const router = useRouter();
const [loading, setLoading] = useState(false);

const onCreateProject = async () => {
    if (!user) {
        router.push('/sign-in');
        return;
    }

    if (!userInput) return;

    setLoading(true);
    try {
        // CORRECTED: This matches your folder structure 'app/api/project'
        const response = await axios.post("/api/project", {
            userInput: userInput,
            device: device,
        });

        const projectId = response.data?.projectId;
        if (projectId) {
            router.push(`/project/${projectId}`);
        } else {
            console.error("No projectId returned from server");
        }
    } catch (error: any) {
        console.error('Failed to create project:', error.response?.data || error.message);
    } finally {
        setLoading(false);
    }
     };
      

  return (
    <div className='p-10 md:px-24 lg:px-48 xl:px-60 mt-20'>
      {/* Animated Gradient Text Section */}
      <div className="flex justify-center mb-5">
        <AnimatedGradientText className='text-sm font-medium'>
          Introducing Magic UI <ChevronRight className="ml-1 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedGradientText>
      </div>

      {/* Main Hero Content */}
      <h2 className='text-5xl font-bold text-center'>
        Design High Quality <span className='text-primary'>Website and Mobile App</span> Designs
      </h2>
      <p className='text-center text-gray-600 text-lg mt-3'>
        Imagine your idea and turn into reality
      </p>

      {/* Input Group Section */}
      <div className='flex mt-5 w-full gap-6 items-center justify-center'>
        <InputGroup className='max-w-xl bg-white z-10 rounded-2xl'>
          <InputGroupTextarea
            className='flex field-sizing-content min-h-24 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base'
            placeholder="Enter what design you want to create..."
            value={userInput}
            onChange={(event) => setUserInput(event.target?.value)}
          />
          <InputGroupAddon align="block-end">
            <Select defaultValue="Website" onValueChange={(value: string) => setDevice(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputGroupButton
              className="ml-auto"
              disabled={loading}
              size="sm"
              variant="default"
              onClick={onCreateProject}
            >
                {loading ? <Loader className="animate-spin"/> : <Send />}
             
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className='flex gap-3 mt-4'>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => setUserInput(suggestion?.description)}
            className='p-2 border rounded-2xl flex flex-col items-center bg-white z-10 cursor-pointer'
          >
            <h2 className='text-lg'>{suggestion?.icon}</h2>
            <h2 className='text-center line-clamp-2 text-sm'>
              {suggestion?.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;