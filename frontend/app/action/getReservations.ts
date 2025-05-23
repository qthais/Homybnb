import { authenticatedAxios } from "@/utils/authenticatedAxiosServer"

interface IParams{
    listingId?:string,
    userId?:string,
    authorId?:string,
}

export default async function getReservations(params:IParams){
    try{
        const {listingId,userId,authorId}=params
        const query:any={}
        if(listingId){
            query.listingId=listingId
        }
        if(userId){
            query.userId=userId
        }
        if(authorId){
            query.listing={userId:authorId}
        }
        const res= await authenticatedAxios({
            method:'POST',
            url:'/api/reservations/options',
            data:query
        })
        const reservations=res.data.data.reservations||[]
        return reservations
    }catch(err:any){
        throw err.response.data
    }
}