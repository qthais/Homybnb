'use client'
import { initiateCheckout } from '@/app/action/makePayment';
import Container from '@/app/components/Container';
import ListingHead from '@/app/components/listings/ListingHead';
import ListingInfo from '@/app/components/listings/ListingInfo';
import ListingReservation from '@/app/components/listings/ListingReservation';
import { categories } from '@/app/components/navbar/Categories';
import useLoginModal from '@/app/hooks/useLoginModal';
import { Listing, Reservation, SafeUser } from '@/types/SchemaType'
import { useAuthenticatedAxios } from '@/utils/authenticatedAxiosClient';
import { differenceInCalendarDays, eachDayOfInterval } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Range } from 'react-date-range';
import toast from 'react-hot-toast';

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
}

interface ListingClientProps {
    reservations?: Reservation[];
    listing: Listing & {
        user: SafeUser
    }
    currentUser?: SafeUser | null
}
const ListingClient: React.FC<ListingClientProps> = ({
    listing,
    reservations = [],
    currentUser
}) => {
    const { data: session } = useSession()
    const axios = useAuthenticatedAxios()
    const loginModal = useLoginModal()
    const router = useRouter()
    const disableDates = useMemo(() => {
        let dates: Date[] = [];
        reservations.forEach((reservation) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            });
            dates = [...dates, ...range]
        })
        return dates;
    }, [reservations])

    const [isLoading, setIsLoading] = useState(false)
    const [totalPrice, setTotalPrice] = useState(listing.price)
    const [dateRange, setDateRange] = useState<Range>(initialDateRange)
    const onCreateReservation = useCallback(async () => {
        const token = session?.tokens?.accessToken
        if (!currentUser) {
            return loginModal.onOpen()
        }
        setIsLoading(true)
        const requestData = {
            accessToken:token,
            listing: listing,   // Send the listing title
            totalPrice,                    // Send the calculated total price
            startDate: dateRange.startDate, // Send the start date
            endDate: dateRange.endDate,     // Send the end date
        };
        try {

            // await axios.post('/api/reservations', {
            //     totalPrice,
            //     startDate: dateRange.startDate,
            //     endDate: dateRange.endDate,
            //     listingId: listing?.id
            // })
            const response = await fetch('/api/checkout-sessions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify(requestData), // Send the request data as JSON
            });

            // Parse the JSON response
            const stripeSession = await response.json();

            // Check if there was an error in the response
            if (stripeSession.error) {
                console.error('Error creating Stripe stripeSession:', stripeSession.error);
                return;
            }

            const sessionId = stripeSession.id;

            // Step 3: Redirect to Stripe checkout page
            await initiateCheckout(sessionId);
        } catch (err: any) {
            console.log(err)
            toast.error(err?.response.data.message || "Some thing went wrong!")
        } finally {
            setIsLoading(false)
        }
    }, [totalPrice, dateRange, currentUser, loginModal,listing])
    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInCalendarDays(
                dateRange.endDate,
                dateRange.startDate
            );
            console.log({ dayCount })
            if (dayCount && listing.price) {
                setTotalPrice(dayCount * listing.price)
            } else {
                setTotalPrice(listing.price)
            }
        }
    }, [dateRange, listing.price])
    const category = useMemo(() => {
        return categories.find((item) => item.label == listing.category)
    }, [listing.category])
    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead
                        id={listing.id}
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        locationValue={listing.locationValue}
                        currentUser={currentUser}
                    />
                    <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-7
                    md:gap-10
                    mt-6
                    ">
                        <ListingInfo
                            user={listing.user}
                            category={category}
                            description={listing.description}
                            roomCount={listing.roomCount}
                            guestCount={listing.guestCount}
                            bathroomCount={listing.bathroomCount}
                            locationValue={listing.locationValue}
                        />
                        <div className='
                        order-first
                        mb-10
                        md:order-last
                        md:col-span-3
                        '>
                            <ListingReservation
                                price={listing.price}
                                totalPrice={totalPrice}
                                dateRange={dateRange}
                                onChangeDate={(value) => setDateRange(value)}
                                onSubmit={onCreateReservation}
                                disabled={isLoading}
                                disableDates={disableDates}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ListingClient