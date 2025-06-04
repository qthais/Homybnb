import { create } from "zustand";

interface UpdatePropertyModalStore{
    listingId:number|null;
    isOpen:boolean;
    onOpen:(id:number)=>void;
    onClose:()=>void;
}

const useUpdatePropertyModal= create<UpdatePropertyModalStore>((set)=>({
    isOpen:false,
    listingId:null,
    onOpen: (id) => set({ isOpen: true, listingId: id }),
    onClose: () => set({ isOpen: false, listingId: null })
}))
export default useUpdatePropertyModal