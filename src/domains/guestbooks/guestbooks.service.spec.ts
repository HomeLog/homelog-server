import { Test, TestingModule } from '@nestjs/testing';
import { GuestbooksService } from './guestbooks.service';

describe('GuestBooksService', () => {
  let service: GuestbooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestbooksService],
    }).compile();

    service = module.get<GuestbooksService>(GuestbooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
