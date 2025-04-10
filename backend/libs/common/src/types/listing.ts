// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v6.30.1
// source: proto/listing.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const listingProtobufPackage = "listing";
export interface UserIdDto {
  userId: string;
}

export interface CreateListingDto {
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathroomCount: number;
  guestCount: number;
  locationValue: string;
  userId: string;
  price: number;
}

export interface ListingResponseDto {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathroomCount: number;
  guestCount: number;
  locationValue: string;
  userId: string;
  price: number;
  createdAt?: string | undefined;
}

export interface GetListingsResponseDto {
  listings: ListingResponseDto[];
}

export const LISTING_PACKAGE_NAME = "listing";

export interface ListingServiceClient {
  createListing(request: CreateListingDto): Observable<ListingResponseDto>;

  getListings(request: UserIdDto): Observable<GetListingsResponseDto>;
}

export interface ListingServiceController {
  createListing(
    request: CreateListingDto,
  ): Promise<ListingResponseDto> | Observable<ListingResponseDto> | ListingResponseDto;

  getListings(
    request: UserIdDto,
  ): Promise<GetListingsResponseDto> | Observable<GetListingsResponseDto> | GetListingsResponseDto;
}

export function ListingServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createListing", "getListings"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ListingService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ListingService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}
export const LISTING_SERVICE_NAME = "ListingService";