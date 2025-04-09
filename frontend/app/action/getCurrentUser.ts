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
        console.log('response',res.data)
        if(res.status==200){
            console.log(session?.user)
            return session?.user
        }
        return null
    }catch(err){
        console.error("getCurrentUser error:", err?.response || err?.message || err);
        return null
    }
    
}