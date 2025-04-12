import getCurrentUser from '@/app/action/getCurrentUser'
import ClientOnly from '@/app/components/ClientOnly'
import EmptyState from '@/app/components/EmptyState'
import axiosClient from '@/utils/axiosClient'
import React from 'react'
import ListingClient from './ListingClient'
interface IParams {
  listingId?: number
}
const ListingPage = async ({ params }: { params: IParams }) => {
  const {listingId}= await params
  const res = await axiosClient.get(`/api/listing/${listingId}`)
  const listing = res.data.data.listing
  const currentUser=await getCurrentUser()
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
      listing={listing}
      currentUser={currentUser}
      />
    </ClientOnly>
  )
}

export default ListingPage