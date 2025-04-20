'use client'
import React, { useEffect } from 'react'
import EmptyState from './components/EmptyState'
interface ErrorStateProps{
    error:Error
}
const error:React.FC<ErrorStateProps> = ({
    error
}) => {
    useEffect(()=>{
        console.log(error.message)
    },[error])
  return (
    <EmptyState
    title='Error'
    subtitle='Something went wrong!'
    />
  )
}

export default error