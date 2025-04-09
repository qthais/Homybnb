
type User = {
    name: string | null;
    email: string | null;
    image: string | null;
    hashedPassword: string | null;
    id: string;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export type SafeUser = {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  };
  export interface Listing {
    id: number;
    title: string;
    description: string;
    imageSrc: string;
    createdAt: String;
    category: string;
    roomCount: number;
    bathroomCount: number;
    guestCount: number;
    locationValue: string;
    userId: string;
    price: number;
    user?: User;
    reservations?: Reservation[];
  }
  
  export interface Reservation {
    id: number;
    userId: string;
    listingId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    createdAt: String;
    user?: User;
    listing?: Listing;
  }
  
export default User