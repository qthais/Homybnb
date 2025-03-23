import { authOptions } from "@/pages/api/auth/[...nextauth]";
import axiosClient from "@/utils/axiosClient";
import { getServerSession } from "next-auth";

export async function getSession() {
    return await getServerSession(authOptions)
}
export default async function getCurrentUser() {
    try{
        const session= await getSession()
        if(!session?.user?.email){
            return null
        }
        const res=await axiosClient.post('/api/users/find',{email:session.user.email})
        const currentUser=res.data?.data?.user
        if(!currentUser){
            return null
        }
        return currentUser
    }catch(err){
        console.log(err)
        return null
    }
    
}