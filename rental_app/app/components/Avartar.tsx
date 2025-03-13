'use client'
import Image from 'next/image'
import React from 'react'

const Avartar = () => {
  return (
    <Image
    className='rounded-full'
    height={30}
    width={30}
    alt='Avatar'
    src={'/images/placeholder.png'}
    />
  )
}

export default Avartar