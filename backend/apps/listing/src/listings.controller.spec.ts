import { Test, TestingModule } from '@nestjs/testing';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';

describe('ListingController', () => {
  let listingController: ListingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [ListingService],
    }).compile();

    listingController = app.get<ListingController>(ListingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(listingController.getHello()).toBe('Hello World!');
    });
  });
});
