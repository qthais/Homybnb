'use client'
import axios from 'axios'
import React, { useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import Modal from './Modal'
import Heading from '../Heading'
import Input from './inputs/Input'
import toast from 'react-hot-toast'
import Button from '../Button'
import { FcGoogle } from 'react-icons/fc'
import { AiFillGithub } from 'react-icons/ai'
import useLoginModal from '@/app/hooks/useLoginModal'
import useRegisterModal from '@/app/hooks/useRegisterModal'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const LoginModal = () => {
    const router = useRouter()
    const registerModal = useRegisterModal()
    const loginModal = useLoginModal()
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: ''
        },
    })
    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        setIsLoading(true)
        signIn('credentials', {
            ...data,
            redirect: false,
        }).then((callback) => {
            setIsLoading(false)
            if (callback?.ok) {
                toast.success('Logged in')
                router.refresh()
                loginModal.onClose()
            }
            if (callback?.error) {
                toast.error(callback.error || "Logout failed")
            }
        }).catch(err => {
            setIsLoading(false);
            toast.error(err?.message);
        })
    }
    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading title='Welcome back' subtitle='Login to your account!' />
            <Input
                register={register}
                id='email'
                label='Email'
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
    const footerContent = (
        <div className='flex flex-col gap-4 mt-3'>
            <hr />
            <Button outline onClick={() => {signIn('google') }} label='Continue with Google' icon={FcGoogle} />
            <Button outline onClick={() => {signIn('github') }} label='Continue with Github' icon={AiFillGithub} />
            <div className=" text-neutral-500 text-center mt-4 font-light">
                <div className="justify-center flex flex-row items-center gap-2">

                    <div>Already have an account?</div>
                    <div onClick={registerModal.onClose} className='text-neutral-800 cursor-pointer hover:underline'>Login</div>
                </div>
            </div>
        </div>
    )
    return (
        <Modal
            disabled={isLoading}
            isOpen={loginModal.isOpen}
            title='Login'
            actionLabel='Continue'
            onClose={loginModal.onClose}
            body={bodyContent}
            onSubmit={handleSubmit(onSubmit)}
            footer={footerContent}
        />
    )
}

export default LoginModal