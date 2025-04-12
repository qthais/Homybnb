import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import { getServerSession } from "next-auth";

export async function getSession() {
    return await getServerSession(authOptions)
}
export default async function getCurrentUser() {
    try{
        const session= await getSession()

        const res=await authenticatedAxios({
            method:'get',
            url:'/api/auth/authCheck',
        })
        if(res.status==200){
            console.log({
                sessionUser:session?.user
            })
            return session?.user
        }
        return null
    }catch(err){
        return null
    }
    
}