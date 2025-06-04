'use client'
import { Listing, Reservation, SafeUser } from '@/types/SchemaType'
import React, { useCallback, useState } from 'react'
import Container from '../components/Container';
import Heading from '../components/Heading';
import { useRouter } from 'next/navigation';
import { useAuthenticatedAxios } from '@/utils/authenticatedAxiosClient';
import toast from 'react-hot-toast';
import ListingCard from '../components/listings/ListingCard';
import useUpdatePropertyModal from '../hooks/useUpdatePropertyModal';
import UpdatePropertyModal from '../components/modals/UpdatePropertyModal';
interface PropertiesClientProps {
    currentUser?: SafeUser | null;
    listings: Listing[];
}
const PropertiesClient: React.FC<PropertiesClientProps> = ({
    currentUser,
    listings
}) => {
    const router = useRouter();
    const axios = useAuthenticatedAxios()
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    const updatePropertyModal = useUpdatePropertyModal()
    const onCancel = useCallback(async (id: number) => {
        try {
            setDeletingId(id);
            await axios.delete(`/api/listings/${id}`)
            toast.success("Listing and all associated reservations deleted successfully!")
            router.refresh()
        } catch (err: any) {
            toast.error(err?.response.data.message || "Something went wrong")
        } finally {
            setDeletingId(null)
        }
    }, [axios, router])
    const onUpdate = useCallback(async (id: number) => {
        try {
            setUpdatingId(id);
            updatePropertyModal.onOpen(id);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        }
    }, []);
    return (
        <Container>
            <UpdatePropertyModal />
            <Heading
                title='Properties'
                subtitle="List of your properties"
            />
            <div className="
        mt-10 
        grid 
        grid-cols-1 
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
        gap-8
        ">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        data={listing}
                        actionId={listing.id}
                        onAction={onCancel}
                        disabled={deletingId == listing.id}
                        actionLabel='Delete property'
                        currentUser={currentUser}
                        secondActionLabel='Update Property'
                        onSecondAction={onUpdate}
                    />
                ))}
            </div>
        </Container>
    )
}

export default PropertiesClient