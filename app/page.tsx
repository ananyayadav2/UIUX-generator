import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Header from "./_shared/Header";
import Hero from "./_shared/Hero";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
<div className='absolute -top-40 -left-40
h-[500px] w-[500px] bg-purple-400/20 blur-[120px] rounded-full' />

<div className='absolute top-20 right-[-200px]
h-[500px] w-[500px] bg-pink-400/20 blur-[120px] rounded-full' />

<div className='absolute bottom-[-200px] left-1/3
h-[500px] w-[500px] bg-blue-400/20 blur-[120px] rounded-full' />

<div className='absolute top-[200px] left-1/2
h-[500px] w-[500px] bg-sky-400/20 blur-[120px] rounded-full' />
    </div>
  );
}