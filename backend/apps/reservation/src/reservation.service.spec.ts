import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/PrismaService';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  AUTH_PACKAGE_NAME,
  LISTING_PACKAGE_NAME,
  RESERVATION_PACKAGE_NAME,
} from '@app/common';
import cleanListing from '@app/common/functions/cleanListing';
import { of } from 'rxjs';
import { ReservationService } from './reservation.service';
import cleanReservation from '@app/common/functions/cleanReservation';
import { EmailService } from './email/email.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let prismaService: PrismaService;
  const mockPrismaService = {
    reservation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(null),
    sendCancellationEmail: jest.fn().mockResolvedValue(null),
  };
  const mockAuthGrpcService = {
    getService: jest.fn().mockReturnValue({
      findUserByEmail: jest.fn().mockReturnValue(of({ name: 'Mocked User' })),
      findOneUser: jest
        .fn()
        .mockReturnValue(of({ email: 'mock@email.com', name: 'Mocked User' })),
    }),
  };

  const mockListingClient = {
    getListingById: jest.fn(),
  };
  const mockListingGrpcService = {
    getService: jest.fn().mockReturnValue(mockListingClient),
  };
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LISTING_PACKAGE_NAME, useValue: mockListingGrpcService },
        { provide: AUTH_PACKAGE_NAME, useValue: mockAuthGrpcService },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();
    service = module.get<ReservationService>(ReservationService);
    service.onModuleInit();
  });
  it('should create a reservation', async () => {
    const mockListing = {
      id: 1,
      title: 'Cozy House',
    };
    const dto = {
      userId: 'u1',
      listingId: 1,
      startDate: '2025-01-01T00:00:00.000Z', // ✅ ISO format
      endDate: '2025-01-02T00:00:00.000Z',
      totalPrice: 100,
    };

    const mockRes = {
      id: 1,
      ...dto,
      createdAt: new Date(),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    };
    mockListingClient.getListingById.mockReturnValue(of(mockListing));
    mockPrismaService.reservation.create.mockResolvedValue(mockRes);

    const result = await service.createReservation(dto);
    expect(result).toEqual(cleanReservation(mockRes));
    expect(mockPrismaService.reservation.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        listingId: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalPrice: 100,
      },
    });
  });
  it('should throw error if listingId is missing in createReservation', async () => {
    const dto = {
      userId: 'u1',
      listingId: null,
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-02T00:00:00.000Z',
      totalPrice: 100,
    };

    try {
      await service.createReservation(dto as any);
    } catch (err) {
      expect(err).toBeInstanceOf(RpcException);
      expect(err.getError().details).toBe('Listing ID is required!');
      expect(err.getError().code).toBe(status.INVALID_ARGUMENT);
    }
  });
  it('should throw error if listing not found', async () => {
    const dto = {
      userId: 'u1',
      userEmail: 'user@example.com',
      listingId: 999, // nonexistent listing
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-02T00:00:00.000Z',
      totalPrice: 100,
    };
    mockListingClient.getListingById.mockReturnValue(of(null));
    try {
      await service.createReservation(dto);
    } catch (err) {
      expect(err).toBeInstanceOf(RpcException);
      expect(err.getError().details).toBe('Listing no longer exist');
      expect(err.getError().code).toBe(status.NOT_FOUND);
    }
  });
  it('should throw error if reservationId is missing in getReservationById', async () => {
    try {
      await service.getReservationById({} as any);
    } catch (err) {
      expect(err).toBeInstanceOf(RpcException);
      expect(err.getError().details).toBe('Reservation ID is required!');
      expect(err.getError().code).toBe(status.INVALID_ARGUMENT);
    }
  });
  it('should throw error if reservation not found', async () => {
    mockPrismaService.reservation.findUnique.mockResolvedValue(null);

    try {
      await service.getReservationById({ reservationId: 999 });
    } catch (err) {
      expect(err).toBeInstanceOf(RpcException);
      expect(err.getError().details).toBe('No reservation found!');
      expect(err.getError().code).toBe(status.NOT_FOUND);
    }
  });

  it('should return reservation by ID', async () => {
    const mockRes = {
      id: 1,
      userId: 'u1',
      listingId: 1,
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 100,
      createdAt: new Date(),
    };
    mockPrismaService.reservation.findUnique.mockResolvedValue(mockRes);

    const result = await service.getReservationById({ reservationId: 1 });
    expect(result).toEqual(cleanReservation(mockRes));
  });
  it('should throw error if reservationId is missing in deleteReservationById', async () => {
    try {
      await service.deleteReservationById({
        userEmail: 'test@gmail.com',
      } as any);
    } catch (err) {
      expect(err.getError().details).toBe('No Reservation ID provided');
      expect(err.getError().code).toBe(status.INVALID_ARGUMENT);
    }
  });
  it('should throw NOT_FOUND if reservation not found in deleteReservationById', async () => {
    const error = { code: 'P2025' };
    mockPrismaService.reservation.delete.mockRejectedValue(error);

    try {
      await service.deleteReservationById({ reservationId: 123 });
    } catch (err) {
      expect(err.getError().details).toBe('No reservation found to delete');
      expect(err.getError().code).toBe(status.NOT_FOUND);
    }
  });

  it('should delete reservation by ID', async () => {
    mockPrismaService.reservation.delete.mockResolvedValue({
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    });
    const result = await service.deleteReservationById({ reservationId: 1 });
    expect(result).toEqual({ message: 'Cancel successfully' });
    expect(mockPrismaService.reservation.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should delete reservation if user is authorized', async () => {
    const mockRes = {
      id: 1,
      listingId: 1,
      userId: 'u1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-02'),
    };
    const listingMock = { id: 1, userId: 'u1' };

    mockPrismaService.reservation.findUnique.mockResolvedValue(mockRes);
    mockListingClient.getListingById.mockReturnValue(of(listingMock));
    mockPrismaService.reservation.delete.mockResolvedValue({});

    const result = await service.deleteReservationsByOption({
      reservationId: 1,
      userId: 'u1',
    });
    expect(result.message).toMatch(/Cancel successfully/i);
  });
});
