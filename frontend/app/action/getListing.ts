import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import getCurrentUser from "./getCurrentUser";
export interface IListingParams{
    userId?:string;
    guestCount?:number;
    roomCount?:number;
    bathroomCount?:number;
    startDate?:string;
    endDate?:string;
    locationValue?:string;
    category?:string;
}
export default async function getListing(params:IListingParams) {
    try{
        const {
            userId,
            roomCount,
            guestCount,
            bathroomCount,
            startDate,
            endDate,
            locationValue,
            category
        }
        =await params
        let url='/api/listings'
        if(userId){
            url='/api/listings/mine'
        }
        const listingsResponse= await authenticatedAxios({
            method:"GET",
            url:url,
        })
        return listingsResponse.data.data.listings
    }catch(err){
        throw err.response.data
    }
}