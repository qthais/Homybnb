import { Test, TestingModule } from '@nestjs/testing';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import {
  CreateListingDto,
  DeleteListingDto,
  GetFavoritesDto,
  GetListingsByOptionDto,
  ListingIdDto,
} from '@app/common';

describe('ListingController', () => {
  let controller: ListingController;
  let service: ListingService;

  const mockListingService = {
    createListing: jest.fn(),
    getListingsOfUser: jest.fn(),
    getListingById: jest.fn(),
    getListings: jest.fn(),
    getListingsByOption: jest.fn(),
    getFavotires: jest.fn(),
    deleteListing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [{ provide: ListingService, useValue: mockListingService }],
    }).compile();

    controller = module.get<ListingController>(ListingController);
    service = module.get<ListingService>(ListingService);
  });

  it('should delegate createListing to service', async () => {
    const dto: CreateListingDto = {
      title: 'Test',
      description: 'desc',
      imageSrc: 'img',
      category: 'house',
      roomCount: 2,
      bathroomCount: 1,
      guestCount: 2,
      locationValue: 'NY',
      userId: 'u1',
      price: 100,
    };
    const result = { id: 'l1', ...dto };
    mockListingService.createListing.mockResolvedValue(result);

    const res = await controller.createListing(dto);
    expect(res).toBe(result);
    expect(service.createListing).toHaveBeenCalledWith(dto);
  });

  it('should delegate getListingsOfUser to service', async () => {
    mockListingService.getListingsOfUser.mockResolvedValue(['listing1']);
    const res = await controller.getListingsOfUser({userId:'user123'});
    expect(res.listings).toEqual(['listing1']);
    expect(service.getListingsOfUser).toHaveBeenCalledWith('user123');
  });

  it('should delegate getListingById to service', async () => {
    const dto: ListingIdDto = { listingId: 1 };
    const expected = { id: 1 };
    mockListingService.getListingById.mockResolvedValue(expected);

    const res = await controller.getListingById(dto);
    expect(res).toBe(expected);
    expect(service.getListingById).toHaveBeenCalledWith(dto);
  });

  it('should delegate getListings to service', async () => {
    const expected = [{ id: 1 }];
    mockListingService.getListings.mockResolvedValue(expected);

    const res = await controller.getListings();
    expect(res.listings).toBe(expected);
    expect(service.getListings).toHaveBeenCalled();
  });

  it('should delegate getListingsByOption to service', async () => {
    const dto: GetListingsByOptionDto = { locationValue: 'NY' };
    const expected = [{ id: 1 }];
    mockListingService.getListingsByOption.mockResolvedValue(expected);

    const res = await controller.getListingsByOption(dto);
    expect(res.listings).toBe(expected);
    expect(service.getListingsByOption).toHaveBeenCalledWith(dto);
  });

  it('should delegate getFavorites to service', async () => {
    const dto: GetFavoritesDto = { listingIds: [1, 2] };
    const expected = [{ id: 1 }];
    mockListingService.getFavotires.mockResolvedValue(expected);

    const res = await controller.getFavorites(dto);
    expect(res.listings).toBe(expected);
    expect(service.getFavotires).toHaveBeenCalledWith(dto);
  });

  it('should delegate deleteListing to service', async () => {
    const dto: DeleteListingDto = { listingId: 1, userId: 'u1' };
    const expected = { message: 'Deleted' };
    mockListingService.deleteListing.mockResolvedValue(expected);

    const res = await controller.deleteListing(dto);
    expect(res).toBe(expected);
    expect(service.deleteListing).toHaveBeenCalledWith(dto);
  });
});
