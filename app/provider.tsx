"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({ children }: any) {
const [userDetails, setUserDetails] = useState()
  useEffect(()=>{
    CreateNewUser();
  },[])

  const CreateNewUser=async()=>{
    const result=await axios.post('/api/user',{});
    console.log(result.data);
    setUserDetails(result?.data);
  }

  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  )
}

export default Provider