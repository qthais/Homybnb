import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import {
  CreateReservationDto,
  DeleteOptionDto,
  ReservationOptionDto,
} from '@app/common';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservationService = {
    createReservation: jest.fn(),
    getReservationById: jest.fn(),
    deleteReservationById: jest.fn(),
    deleteReservationsByOption: jest.fn(),
    getReservationsByOption: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  it('should delegate createReservation to service', async () => {
    const dto: CreateReservationDto = {
      userId: 'u1',
      listingId: 1,
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-02T00:00:00.000Z',
      totalPrice: 150,
    };
    const result = { id: 1, ...dto };
    mockReservationService.createReservation.mockResolvedValue(result);

    const res = await controller.createReservation(dto);
    expect(res).toBe(result);
    expect(service.createReservation).toHaveBeenCalledWith(dto);
  });

  it('should delegate getReservationById to service', async () => {
    const mockRes = { id: 1 };
    mockReservationService.getReservationById.mockResolvedValue(mockRes);

    const res = await controller.getReservationById({reservationId:1});
    expect(res).toBe(mockRes);
    expect(service.getReservationById).toHaveBeenCalledWith({ reservationId: 1 });
  });

  it('should delegate deleteReservationById to service', async () => {
    const result = { message: 'Deleted' };
    mockReservationService.deleteReservationById.mockResolvedValue(result);

    const res = await controller.deleteReservationById({reservationId:1});
    expect(res).toBe(result);
    expect(service.deleteReservationById).toHaveBeenCalledWith({ reservationId: 1 });
  });

  it('should delegate deleteReservationsByOption to service', async () => {
    const dto: DeleteOptionDto = { reservationId: 1, userId: 'u1' };
    const result = { message: 'Cancel successfully!' };
    mockReservationService.deleteReservationsByOption.mockResolvedValue(result);

    const res = await controller.deleteReservationsByOption(dto);
    expect(res).toBe(result);
    expect(service.deleteReservationsByOption).toHaveBeenCalledWith(dto);
  });

  it('should delegate getReservationByOption to service', async () => {
    const dto: ReservationOptionDto = { userId: 'u1' };
    const result = [{ id: 1 }];
    mockReservationService.getReservationsByOption.mockResolvedValue(result);

    const res = await controller.getReservationByOption(dto);
    expect(res.reservations).toBe(result);
    expect(service.getReservationsByOption).toHaveBeenCalledWith(dto);
  });
});
