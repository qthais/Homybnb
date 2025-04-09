// hooks/useAuthenticatedAxios.ts
'use client'

import { useSession } from 'next-auth/react'
import axiosClient from '@/utils/axiosClient'
import axios, { AxiosInstance } from 'axios'
import { useMemo } from 'react'

export function useAuthenticatedAxios(): AxiosInstance {
  const { data: session } = useSession()
  
  // Create a memoized axios instance
  const authAxios = useMemo(() => {
    const instance = axios.create(axiosClient.defaults)
    
    // Add request interceptor that checks fresh session on every request
    instance.interceptors.request.use((config) => {
      const token = session?.tokens?.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    return instance
  }, [session?.tokens?.accessToken]) 

  return authAxios
}