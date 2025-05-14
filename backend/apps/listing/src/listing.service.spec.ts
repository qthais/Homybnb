import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from './listing.service';
import { PrismaService } from '../prisma/PrismaService';
import { RpcException } from '@nestjs/microservices';
import { Listing, Prisma } from '../prisma/generated';
import { status } from '@grpc/grpc-js';
import { AUTH_PACKAGE_NAME, RESERVATION_PACKAGE_NAME } from '@app/common';
import cleanListing from '@app/common/functions/cleanListing';
import { of } from 'rxjs';

describe('ListingService', () => {
  let service: ListingService;
  let prismaService: PrismaService;

  // Mocking dependencies
  const mockPrismaService = {
    listing: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete:jest.fn(),
    },
  };
  const mockUserService = {
    findOneUser: jest.fn(),
  };
  const mockAuthService = {
    getService: jest.fn().mockReturnValue(mockUserService),
  };
  const mockReservationGrpcService = {
    getReservationByOption: jest.fn(),
    deleteReservationById: jest.fn(),
  };
  // or mock needed methods
  const mockReservationService = {
    getService: jest.fn().mockReturnValue(mockReservationGrpcService),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AUTH_PACKAGE_NAME, useValue: mockAuthService },
        { provide: RESERVATION_PACKAGE_NAME, useValue: mockReservationService },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
    prismaService = module.get<PrismaService>(PrismaService);
    service.onModuleInit();
  });

  describe('createListing', () => {
    it('should throw an error if title is missing', async () => {
      const createListingDto = {
        title: '',
        description: 'Test Description',
        imageSrc: 'image.png',
        category: 'House',
        roomCount: 3,
        bathroomCount: 2,
        guestCount: 5,
        locationValue: 'New York',
        userId: 'user123',
        price: 100,
      };

      try {
        await service.createListing(createListingDto);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError().details).toBe('Title is required');
        expect(error.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should throw an error if description is missing', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: '',
        imageSrc: 'image.png',
        category: 'House',
        roomCount: 3,
        bathroomCount: 2,
        guestCount: 5,
        locationValue: 'New York',
        userId: 'user123',
        price: 100,
      };

      try {
        await service.createListing(createListingDto);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError().details).toBe('Description is required');
        expect(error.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should throw an error if price is less than or equal to 0', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: 'Test Description',
        imageSrc: 'image.png',
        category: 'House',
        roomCount: 3,
        bathroomCount: 2,
        guestCount: 5,
        locationValue: 'New York',
        userId: 'user123',
        price: 0,
      };

      try {
        await service.createListing(createListingDto);
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect(error.getError().details).toBe(
          'Price must be a positive number',
        );
        expect(error.getError().code).toBe(status.INVALID_ARGUMENT);
      }
    });

    it('should create a new listing and return it if data is valid', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: 'Test Description',
        imageSrc: 'image.png',
        category: 'House',
        roomCount: 3,
        bathroomCount: 2,
        guestCount: 5,
        locationValue: 'New York',
        userId: 'user123',
        price: 100,
      };

      // Mock Prisma service response
      mockPrismaService.listing.findFirst.mockResolvedValue(null); // No existing listing
      mockPrismaService.listing.create.mockResolvedValue({
        ...createListingDto,
        id: 'listing123',
      });

      const result = await service.createListing(createListingDto);

      expect(result).toEqual({
        ...createListingDto,
        id: 'listing123',
      });
      expect(mockPrismaService.listing.create).toHaveBeenCalledWith({
        data: createListingDto,
      });
    });
    it('should throw an error if listing already exists', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: 'Test Description',
        imageSrc: 'image.png',
        category: 'House',
        roomCount: 3,
        bathroomCount: 2,
        guestCount: 5,
        locationValue: 'New York',
        userId: 'user123',
        price: 100,
      };

      // Setup: tìm thấy listing trùng
      mockPrismaService.listing.findFirst.mockResolvedValue({
        id: 'existing-id',
      });

      await expect(service.createListing(createListingDto)).rejects.toThrow(
        RpcException,
      );

      try {
        await service.createListing(createListingDto);
      } catch (error) {
        expect(error.getError().details).toBe(
          'A listing with the same title and location already exists',
        );
        expect(error.getError().code).toBe(status.ALREADY_EXISTS);
      }
    });
  });
  describe('getListingsOfUser', () => {
    it('should throw an eror if listing not found', async () => {
      mockPrismaService.listing.findMany.mockResolvedValue(null);
      try {
        await service.getListingsOfUser('abc');
      } catch (err) {
        expect(err.getError().details).toBe('No listings found for this user');
        expect(err.getError().code).toBe(status.NOT_FOUND);
      }
    });
    it('should retrieve an array of listings with their owners', async () => {
      const userId = 'abc';
      const fakeListings: Listing[] = [
        {
          id: 1,
          title: 'Cozy Cottage',
          description: 'A nice place to stay',
          imageSrc: 'image.jpg',
          createdAt: new Date(),
          category: 'Cottage',
          roomCount: 2,
          bathroomCount: 1,
          guestCount: 3,
          locationValue: 'Boston',
          userId: userId,
          price: 120,
        },
      ];
      mockPrismaService.listing.findMany.mockResolvedValue(fakeListings);
      const result = await service.getListingsOfUser(userId);
      expect(result).toEqual(fakeListings.map((l) => cleanListing(l)));
      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith({
        where: { userId: 'abc' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
  describe('getListingById', () => {
    it('should return listing if found without extras', async () => {
      const listing = {
        id: 1,
        userId: 'user1',
        createdAt: new Date(),
        title: 'Test',
        description: '',
        imageSrc: '',
        category: '',
        roomCount: 1,
        bathroomCount: 1,
        guestCount: 1,
        locationValue: '',
        price: 100,
      };
      mockPrismaService.listing.findUnique.mockResolvedValue(listing);

      const result = await service.getListingById({ listingId: 1 });
      expect(result).toEqual(cleanListing(listing));
    });
    it('should return listing with user if include.listing is true', async () => {
      const userMock = { id: 'user1', name: 'Test User' };
      const listing = {
        id: 1,
        userId: 'user1',
        createdAt: new Date(),
        title: 'Test',
        description: '',
        imageSrc: '',
        category: '',
        roomCount: 1,
        bathroomCount: 1,
        guestCount: 1,
        locationValue: '',
        price: 100,
      };
      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockUserService.findOneUser.mockReturnValue(of(userMock));

      const result = await service.getListingById({
        listingId: 1,
        include: { user: true },
      });
      expect(result).toEqual({
        ...cleanListing(listing),
        user: userMock,
      });
    });
    it('should return listing with reservations if include.reservations is true',async()=>{
      const userMock = { id: 'user1', name: 'Test User' };
      const listing = {
        id: 1,
        userId: 'user1',
        createdAt: new Date(),
        title: 'Test',
        description: '',
        imageSrc: '',
        category: '',
        roomCount: 1,
        bathroomCount: 1,
        guestCount: 1,
        locationValue: '',
        price: 100,
      };
      const reservationsMock = [
        { id: 'r1', listingId: 1, startDate: '2025-05-01', endDate: '2025-05-03' },
      ];
      mockPrismaService.listing.findUnique.mockResolvedValue(listing)
      mockUserService.findOneUser.mockResolvedValue(of(userMock))
      mockReservationGrpcService.getReservationByOption.mockReturnValue(of({reservations:reservationsMock}))
      const result= await service.getListingById({
        listingId:1,
        include:{reservations:true}
      })
      expect(result).toEqual({
        ...cleanListing(listing),
        reservations:reservationsMock
      })
    })
    it('should return listing with user and reservations if both include options are true', async () => {
      const listing = {
        id: 1,
        userId: 'user1',
        createdAt: new Date(),
        title: 'Test',
        description: '',
        imageSrc: '',
        category: '',
        roomCount: 1,
        bathroomCount: 1,
        guestCount: 1,
        locationValue: '',
        price: 100,
      };
      const userMock = { id: 'user1', name: 'Test User' };
      const reservationsMock = [
        { id: 'r1', listingId: 1, startDate: '2025-05-01', endDate: '2025-05-03' },
      ];
    
      mockPrismaService.listing.findUnique.mockResolvedValue(listing);
      mockUserService.findOneUser.mockReturnValue(of(userMock));
      mockReservationGrpcService.getReservationByOption.mockReturnValue(
        of({ reservations: reservationsMock })
      );
    
      const result = await service.getListingById({
        listingId: 1,
        include: { user: true, reservations: true },
      });
    
      expect(result).toEqual({
        ...cleanListing(listing),
        user: userMock,
        reservations: reservationsMock,
      });
    });

    it('should throw error if listing not found', async () => {
      mockPrismaService.listing.findUnique.mockResolvedValue(null);
      try {
        await service.getListingById({ listingId: 1 });
      } catch (err) {
        expect(err.getError().details).toBe('No listing found');
        expect(err.getError().code).toBe(status.NOT_FOUND);
      }
    });
  });
  describe('getListings', () => {
    it('should return all listings', async () => {
      const listings = [
        {
          id: 1,
          userId: 'u1',
          createdAt: new Date(),
          title: '',
          description: '',
          imageSrc: '',
          category: '',
          roomCount: 1,
          bathroomCount: 1,
          guestCount: 1,
          locationValue: '',
          price: 50,
        },
      ];
      mockPrismaService.listing.findMany.mockResolvedValue(listings);

      const result = await service.getListings();
      expect(result).toEqual(listings.map(cleanListing));
    });

    it('should throw if no listings found', async () => {
      mockPrismaService.listing.findMany.mockResolvedValue([]);
      try {
        await service.getListings();
      } catch (err) {
        expect(err.getError().details).toBe('No listings found for this user');
        expect(err.getError().code).toBe(status.NOT_FOUND);
      }
    });

  });
  describe('getFavorite',()=>{
    it('Should return listings by given favorite IDs', async()=>{
      const listings = [
        {
          id: 1,
          userId: 'u1',
          createdAt: new Date(),
          title: 'Fav 1',
          description: '',
          imageSrc: '',
          category: '',
          roomCount: 1,
          bathroomCount: 1,
          guestCount: 1,
          locationValue: '',
          price: 50,
        },
      ];
      mockPrismaService.listing.findMany.mockResolvedValue(listings)
      const result= await service.getFavotires({listingIds:[1]})
      expect(result).toEqual(listings.map(cleanListing));
      expect(mockPrismaService.listing.findMany).toHaveBeenCalledWith({
        where:{
          id:{
            in:[1]
          }
        }
      })
    })
  })
  describe('deleteListing', () => {
    it('should delete listing and its reservations', async () => {
      const reservationList = [{ id: 'res1' }, { id: 'res2' }];
  
      mockReservationGrpcService.getReservationByOption.mockReturnValue(
        of({ reservations: reservationList })
      );
      mockReservationGrpcService.deleteReservationById.mockReturnValue(of({}));
      mockPrismaService.listing.delete = jest.fn().mockResolvedValue({});
  
      const result = await service.deleteListing({
        listingId: 1,
        userId: 'u1',
      });
  
      expect(result.message).toMatch(/deleted successfully/i);
      expect(mockPrismaService.listing.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockReservationGrpcService.deleteReservationById).toHaveBeenCalledTimes(
        reservationList.length
      );
    });
  });
  
});
