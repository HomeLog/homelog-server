import { Test, TestingModule } from '@nestjs/testing';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksService } from './guestbooks.service';

describe('GuestbooksController', () => {
  let controller: GuestbooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestbooksController],
      providers: [GuestbooksService],
    }).compile();

    controller = module.get<GuestbooksController>(GuestbooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
