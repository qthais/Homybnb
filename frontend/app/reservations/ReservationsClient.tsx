'use client'
import React, { useCallback, useState } from 'react'
import Container from '../components/Container'
import Heading from '../components/Heading'
import { Reservation, SafeUser } from '@/types/SchemaType'
import { useAuthenticatedAxios } from '@/utils/authenticatedAxiosClient'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import ListingCard from '../components/listings/ListingCard'

interface ReservationClientProps{
    reservations:Reservation[];
    currentUser?:SafeUser|null
}

const ReservationsClient:React.FC<ReservationClientProps> = ({
    reservations,
    currentUser
}) => {
    const axios= useAuthenticatedAxios()
    const router=useRouter()
    const [deletingId,setDeletingId]=useState<number|null>(null)
    const onCancel=useCallback(async(id:number)=>{
        try{
            setDeletingId(id);
            await axios.delete(`/api/reservations/${id}/options`)
            toast.success("Reservation cancelled!")
            router.refresh()
        }catch(err){
            toast.error(err?.response.data.message||"Something went wrong")
        }finally{
            setDeletingId(null)
        }
    },[router,axios])
  return (
    <Container>
        <Heading
        title='Reservations'
        subtitle='Bookings on your properties'
        />
        <div className="
        mt-10 
        grid 
        grid-cols-1 
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
        gap-8
        ">
            {reservations.map((reservation)=>(
                <ListingCard
                key={reservation.id}
                data={reservation.listing!}
                reservation={reservation}
                actionId={reservation.id}
                onAction={onCancel}
                disabled={deletingId==reservation.id}
                actionLabel='Cancel guest reservation'
                currentUser={currentUser}
                />
            ))}
        </div>
    </Container>
  )
}

export default ReservationsClient