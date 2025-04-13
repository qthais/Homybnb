'use client'
import { Reservation, SafeUser } from '@/types/SchemaType'
import React, { useCallback, useState } from 'react'
import Container from '../components/Container';
import Heading from '../components/Heading';
import { useRouter } from 'next/navigation';
import { useAuthenticatedAxios } from '@/utils/authenticatedAxiosClient';
import toast from 'react-hot-toast';
import ListingCard from '../components/listings/ListingCard';
interface TripsClientProps{
    currentUser?:SafeUser|null;
    reservations:Reservation[];
}
const TripsClient:React.FC<TripsClientProps> = ({
    currentUser,
    reservations
}) => {
    const router=useRouter();
    const axios=useAuthenticatedAxios()
    const [deletingId,setDeletingId]=useState<number|null>(null)
    const onCancel = useCallback(async(id:number)=>{
        try{
            setDeletingId(id);
            await axios.delete(`/api/reservations/delete/${id}`)
            toast.success("Reservation cancelled!")
            router.refresh()
        }catch(err){
            toast.error(err?.response.data.message||"Something went wrong")
        }finally{
            setDeletingId(null)
        }
    },[axios,router])
  return (
    <Container>
        <Heading 
        title='Trips' 
        subtitle="Where you've been and where you're going"
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
                actionLabel='Cancel reservation'
                currentUser={currentUser}
                />
            ))}
        </div>
    </Container>
  )
}

export default TripsClient