import { Listing } from 'apps/listing/prisma/generated';
import { ListingResponseDto } from '../types';

const cleanListing = (listing: Listing): ListingResponseDto => {
  const cleanedListing:any = { ...listing };
  if (cleanedListing.createdAt instanceof Date) {
    cleanedListing.createdAt = cleanedListing.createdAt.toISOString();
  }
  return cleanedListing;
};
export default cleanListing
