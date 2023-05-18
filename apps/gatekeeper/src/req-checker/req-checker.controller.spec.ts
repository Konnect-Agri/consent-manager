import { Test, TestingModule } from '@nestjs/testing';
import { ReqCheckerController } from './req-checker.controller';

describe('ReqCheckerController', () => {
  let controller: ReqCheckerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReqCheckerController],
    }).compile();

    controller = module.get<ReqCheckerController>(ReqCheckerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
