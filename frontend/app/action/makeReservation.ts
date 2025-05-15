import { authenticatedAxios } from "@/utils/authenticatedAxiosServer"

interface ReservationDto{
    listingId:string,
    startDate:Date,
    endDate:Date,
    totalPrice:number,
}

export default async function makeReservation(reservationDto:ReservationDto){
    try{
        const {listingId,startDate,endDate,totalPrice}=reservationDto
        const res= await authenticatedAxios({
            method:'POST',
            url:'/api/reservations',
            data:{listingId,startDate,endDate,totalPrice}
        })
        const newReservation=res.data.data.reservaion
        return newReservation
    }catch(err:any){
        throw err.response.data
    }
}