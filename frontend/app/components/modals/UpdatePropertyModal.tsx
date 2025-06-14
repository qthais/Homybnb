'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import useUpdatePropertyModal from '@/app/hooks/useUpdatePropertyModal'
import Heading from '../Heading'
import { categories } from '../navbar/Categories'
import CategoryInput from '../inputs/CategoryInput'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import CountrySelect from '../inputs/CountrySelect'
import dynamic from 'next/dynamic'
import Counter from '../inputs/Counter'
import ImageUpload from '../inputs/ImageUpload'
import Input from '../inputs/Input'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useAuthenticatedAxios } from '@/utils/authenticatedAxiosClient'
import { Listing } from '@/types/SchemaType'
import useCountries from '@/app/hooks/useCountries'
enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const UpdatePropertyModal = () => {
  const axios = useAuthenticatedAxios()
  const updatePropertyModal=useUpdatePropertyModal()
  const [coordinates,setCoordinates]= useState<[number, number] | undefined>([0,0])
  const { isOpen, onClose, listingId } = updatePropertyModal;
  const router = useRouter()
      const { getByValue } = useCountries()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
    reset
  } = useForm<FieldValues>()
  const [isLoading, setIsLoading] = useState(false)
  const category = watch('category')
  const location = watch('locationValue')
  const guestCount = watch('guestCount')
  const roomCount = watch('roomCount')
  const bathroomCount = watch('bathroomCount')
  const imageSrc = watch('imageSrc')
  useEffect(() => {
      if (!listingId) return;
    const getListing = async (id: number) => {
      try {
        const res = await axios.get(`/api/listings/${id}`)
        const listingData = res.data.data.listing
        reset({
          category: listingData.category,
          locationValue: getByValue(listingData.locationValue),
          guestCount: listingData.guestCount,
          roomCount: listingData.roomCount,
          bathroomCount: listingData.bathroomCount,
          imageSrc: listingData.imageSrc,
          price: listingData.price,
          title: listingData.title,
          description: listingData.description
        });
          const coor = getByValue(listingData.locationValue)?.latlng
          setCoordinates(coor)
      } catch (err: any) {
        toast.error(err?.response.data.message || "Something went wrong")
      }
    }
    getListing(listingId)
  }, [listingId])
  const Map = useMemo(() => dynamic(() => import('../Map'), {
    ssr: false
  }), [location])
  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }
  const [step, setStep] = useState(STEPS.CATEGORY)
  const onBack = () => {
    setStep((value) => value - 1)
  }
  const onNext = () => {
    setStep((value) => value + 1)
  }
  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return 'Update';
    }
    return 'Next'
  }, [step])
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.PRICE) {
      return onNext()
    }
    setIsLoading(true)
    try {
      const res = await axios.put(`/api/listings/${listingId}`, { ...data, locationValue: location?.value })
      console.log(res)
      toast.success('Listing updated')
      router.refresh()
      reset()
      setStep(STEPS.CATEGORY)
      updatePropertyModal.onClose()
    } catch (err: any) {
      console.log(err)
      toast.error(err?.response?.data.message || "Something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }
  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return 'Back';
  }, [step])
  let bodyContent = (
    <div className='flex flex-col gap-8'>
      <Heading
        title='Which of these best describes your place?'
        subtitle='Pick a category'
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
        {categories.map((item) => (
          <div key={item.label} className='col-span-1'>
            <CategoryInput
              onClick={(category) => { setCustomValue('category', category) }}
              selected={category == item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  )
  if (step == STEPS.LOCATION) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading title='Where is your place located' subtitle='Help guests find you!' />
        <CountrySelect value={location} onChange={(value) => { setCustomValue('locationValue', value) }} />
        <Map
          center={coordinates}
        />
      </div>
    )
  }
  if (step === STEPS.INFO) {
    bodyContent = (
      <div className='flex flex-col gap-8'>
        <Heading title='Share some basics about your place' subtitle='What amenities do you have' />
        <Counter
          title='Guests'
          subtitle='How many guests do you allow?'
          value={guestCount}
          onChange={value => { setCustomValue('guestCount', value) }}
        />
        <hr />
        <Counter
          title='Rooms'
          subtitle='How many rooms do you allow?'
          value={roomCount}
          onChange={value => { setCustomValue('roomCount', value) }}
        />
        <hr />
        <Counter
          title='Bathrooms'
          subtitle='How many bathrooms do you have?'
          value={bathroomCount}
          onChange={value => { setCustomValue('bathroomCount', value) }}
        />
      </div>
    )
  }
  if (step == STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title='Add a photo of your place'
          subtitle='Show guests what your place looks like!'
        />
        <ImageUpload value={imageSrc} onChange={(value) => setCustomValue('imageSrc', value)} />
      </div>
    )
  }
  if (step == STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title='How would you describe your place?' subtitle='Short and sweet works best!' />
        <Input id='title' label='Title' disabled={isLoading} register={register} errors={errors} required />
        <Input id='description' label='Description' disabled={isLoading} register={register} errors={errors} required />
      </div>
    )
  }
  if (step == STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading title='Now, set your price' subtitle='How much do you charge per night?' />
        <Input id='price' label='Price' formatPrice type='number' disabled={isLoading} register={register} errors={errors} required />
      </div>
    )
  }
  return (
    <Modal
      title='Homybnb your home'
      onClose={updatePropertyModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step == STEPS.CATEGORY ? undefined : onBack}
      isOpen={updatePropertyModal.isOpen}
      body={bodyContent}
    />
  )
}

export default UpdatePropertyModal