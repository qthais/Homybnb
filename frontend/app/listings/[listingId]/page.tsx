import getCurrentUser from '@/app/action/getCurrentUser'
import ClientOnly from '@/app/components/ClientOnly'
import EmptyState from '@/app/components/EmptyState'
import axiosClient from '@/utils/axiosClient'
import React from 'react'
import ListingClient from './ListingClient'
import getReservations from '@/app/action/getReservations'
interface IParams {
  listingId?: string
}
const ListingPage = async ({ params }: { params: Promise<IParams> }) => {
  const {listingId}= await params
  const res = await axiosClient.get(`/api/listings/${listingId}`)
  const listing = res.data.data.listing
  const currentUser=await getCurrentUser()
  const reservations= await getReservations({listingId})
  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <ListingClient
      reservations={reservations}
      listing={listing}
      currentUser={currentUser}
      />
    </ClientOnly>
  )
}

export default ListingPage