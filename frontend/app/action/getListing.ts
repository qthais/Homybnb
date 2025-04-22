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
        let method='GET'
        let data:any={}
        let url='/api/listings'
        if(userId){
            url='/api/listings/mine'
        }
        if(roomCount||guestCount||bathroomCount||startDate||endDate||locationValue||category){
            method='POST'
            data={
                roomCount,
                guestCount,
                bathroomCount,
                startDate,
                endDate,
                locationValue,
                category
            }
            url='/api/listings/options'
        }
        let listingsResponse;
        if(method=='GET'){
            listingsResponse= await authenticatedAxios({
                method:method,
                url:url,
            })
        }else{
            listingsResponse= await authenticatedAxios({
                method:method,
                url:url,
                data
            })
        }
        return listingsResponse.data.data.listings??[]
    }catch(err:any){
        console.log(err)
        throw err.response.data
    }
}