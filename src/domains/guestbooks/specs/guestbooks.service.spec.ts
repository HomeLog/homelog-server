import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GuestbooksRepository } from '../components/guestbooks.repository';
import { GuestbooksController } from '../guestbooks.controller';
import { GuestbooksService } from '../guestbooks.service';

describe('GuestBooksService', () => {
  let service: GuestbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        ConfigService,
      ],
      imports: [ConfigModule],
      controllers: [GuestbooksController],
    }).compile();

    service = module.get<GuestbooksService>(GuestbooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
