"use client"
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserButton, useUser } from '@clerk/nextjs';

function Header() {
    const {user} = useUser();
  return (
    <div className='flex items-center justify-between p-3 shadow-md'>
      <div className='flex gap-2 items-center'>
        <Image src={'/logo1.png'} alt='logo' width={40} height={40} />
        <h2 className='text-xl font-semibold'>UIUX MOCK</h2>
      </div>
      <ul className='flex gap-5 items-center text-lg'>
        <li className='hover:text-primary cursor-pointer'>Home</li>
        <li className='hover:text-primary cursor-pointer'>Pricing</li>
      </ul>
      {!user ?   <Button>Get Started</Button> :
      <UserButton />
      
    }
     
    </div>
  );
}

export default Header;