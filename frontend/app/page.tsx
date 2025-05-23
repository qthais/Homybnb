import { authenticatedAxios } from "@/utils/authenticatedAxiosServer";
import ClientOnly from "./components/ClientOnly"
import Container from "./components/Container"
import EmptyState from "./components/EmptyState";
import ListingCard from "./components/listings/ListingCard";
import getCurrentUser from "./action/getCurrentUser";
import getListing, { IListingParams } from "./action/getListing";

const Home=async({searchParams}:{searchParams:Promise<IListingParams>})=> {
  const option= await searchParams
  const listings= await getListing(option)
  const currentUser = await getCurrentUser()

  if (listings.length == 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    )
  }
  return (
    <ClientOnly>
      <Container>
        <div className="
        pt-24 
        grid 
        grid-cols-1 
        sm:grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
        gap-8
        ">
          {listings.map((listing: any) => {
            return (
              <ListingCard
                currentUser={currentUser}
                key={listing.id}
                data={listing}
              />
            )
          })}
        </div>
      </Container>
    </ClientOnly>
  )
}
export default Home