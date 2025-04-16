import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
    try{
        const currentUser= await getCurrentUser()
        const favorites= await authenticatedAxios({
            method:"POST",
            url:'/api/listings/favorites',
            data:{
                listingIds:currentUser?.favoriteIds
            }
        })
        return favorites.data.data.listings
    }catch(err){
        throw err.response.data
    }
}