import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface ProjectHeaderProps {
  onSave: () => void;
  saving: boolean;
}

function ProjectHeader({ onSave, saving }: ProjectHeaderProps) {
  return (
    <div className='flex items-center justify-between p-3 shadow'>
      <div className='flex gap-2 items-center'>
        <Image src={'/logo1.png'} alt='logo' width={40} height={40} />
        <h2 className='text-xl font-semibold'>UIUX MOCK</h2>
      </div>
      <Button onClick={onSave} disabled={saving}>
        <Save /> {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}

export default ProjectHeader