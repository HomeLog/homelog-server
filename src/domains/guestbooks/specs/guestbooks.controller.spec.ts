import { Test, TestingModule } from '@nestjs/testing';
import { GuestbooksRepository } from '../components/guestbooks.repository';
import { GuestbooksController } from '../guestbooks.controller';
import { GuestbooksService } from '../guestbooks.service';

describe('GuestbooksController', () => {
  let controller: GuestbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestbooksController],
      providers: [
        GuestbooksService,
        {
          provide: GuestbooksRepository,
          useValue: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            updateOneBy: jest.fn(),
            findUniqueBy: jest.fn(),
            deleteOneBy: jest.fn(),
          },
        },
        {
          provide: 'StorageService',
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GuestbooksController>(GuestbooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
