import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import getCurrentUser from "./getCurrentUser";
export interface IListingParams{
    userId?:string;
}
export default async function getListing(params:IListingParams) {
    try{
        const {userId}=await params
        let url='/api/listings'
        if(userId){
            url='/api/listings/mine'
        }
        const currentUser= await getCurrentUser()
        const listingsResponse= await authenticatedAxios({
            method:"GET",
            url:url,
        })
        return listingsResponse.data.data.listings
    }catch(err){
        throw err.response.data
    }
}