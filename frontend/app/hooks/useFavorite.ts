import { SafeUser } from "@/types/SchemaType";
import { useRouter } from "next/navigation";
import useLoginModal from "./useLoginModal";
import { useCallback, useMemo } from "react";
import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import toast from "react-hot-toast";
import { useAuthenticatedAxios } from "@/utils/authenticatedAxiosClient";
import { useSession } from "next-auth/react";

interface IUseFavorite{
    listingId:number;
    currentUser?:SafeUser|null
}
const useFavorite=({
    listingId,
    currentUser,
}:IUseFavorite)=>{
    const {update}=useSession()
    const axios=useAuthenticatedAxios()
    const router=useRouter()
    const loginModal=useLoginModal()
    const hasFavorited=useMemo(()=>{
        const list=currentUser?.favoriteIds||[];
        return list.includes(listingId)
    },[currentUser,listingId])
    const toggleFavorite= useCallback(async(e:React.MouseEvent<HTMLDivElement>)=>{
        e.stopPropagation()
        if(!currentUser){
            return loginModal.onOpen()
        }
        try{
            const updatedFavoriteIds= hasFavorited?currentUser.favoriteIds?.filter((id)=>id!=listingId)
            :[...(currentUser.favoriteIds||[]),listingId]
            const res=await axios.patch('/api/users/update',{favoriteIds:updatedFavoriteIds})
            await update({ favoriteIds: updatedFavoriteIds });
            router.refresh()
            toast.success("Update successfully!")
        }catch(err){
            console.log(err)
            toast.error(err.response?.data.message||"Some thing went wrong!")
        }
    },[currentUser,hasFavorited,listingId,loginModal,router,axios])
    return {
        hasFavorited,
        toggleFavorite
    }
}
export default useFavorite;