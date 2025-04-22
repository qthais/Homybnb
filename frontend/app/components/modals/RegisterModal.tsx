'use client'
import useRegisterModal from '@/app/hooks/useRegisterModal'
import React, { useCallback, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Modal from './Modal'
import Heading from '../Heading'
import Input from '../inputs/Input'
import toast from 'react-hot-toast'
import Button from '../Button'
import { FcGoogle } from 'react-icons/fc'
import { AiFillGithub } from 'react-icons/ai'
import axiosClient from '@/utils/axiosClient'
import { signIn } from 'next-auth/react'
import useLoginModal from '@/app/hooks/useLoginModal'

const RegisterModal = () => {
    const RegisterModal = useRegisterModal()
    const LoginModal= useLoginModal()
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        },
    })
    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        try {
            setIsLoading(true)
            const res = await axiosClient.post('/api/auth/register', data)
            LoginModal.onOpen()
            toast.success('Register successfully')
            RegisterModal.onClose()
        } catch (err:any) {
            toast.error(err.response?.data.message||'Some thing went wrong!')
        } finally {
            setIsLoading(false)
        }
    }
    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title='Welcome to Airbnb' subtitle='Create an account!' />
            <Input
                register={register}
                id='email'
                label='Email'
                disabled={isLoading}
                errors={errors}
                required />
            <Input
                register={register}
                id='name'
                label='Name'
                disabled={isLoading}
                errors={errors}
                required />
            <Input
                register={register}
                id='password'
                type='password'
                label='Password'
                disabled={isLoading}
                errors={errors}
                required />
        </div>
    )
        const toggle=  useCallback(()=>{
            RegisterModal.onClose()
            LoginModal.onOpen()
        },[LoginModal,RegisterModal])
    const footerContent = (
        <div className='flex flex-col gap-4 mt-3'>
            <hr />
            <Button outline onClick={() => {signIn('google') }} label='Continue with Google' icon={FcGoogle} />
            <Button outline onClick={() => {signIn('github') }} label='Continue with Github' icon={AiFillGithub} />
            <div className=" text-neutral-500 text-center mt-4 font-light">
                <div className="justify-center flex flex-row items-center gap-2">

                    <div>Already have an account?</div>
                    <div onClick={toggle} className='text-neutral-800 cursor-pointer hover:underline'>Login</div>
                </div>
            </div>
        </div>
    )
    return (
        <Modal
            disabled={isLoading}
            isOpen={RegisterModal.isOpen}
            title='Register'
            actionLabel='Continue'
            onClose={RegisterModal.onClose}
            body={bodyContent}
            onSubmit={handleSubmit(onSubmit)}
            footer={footerContent}
        />
    )
}

export default RegisterModal