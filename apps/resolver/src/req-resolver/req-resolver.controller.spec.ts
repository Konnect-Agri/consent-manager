import { Test, TestingModule } from '@nestjs/testing';
import { ReqResolverController } from './req-resolver.controller';

describe('ReqResolverController', () => {
  let controller: ReqResolverController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReqResolverController],
    }).compile();

    controller = module.get<ReqResolverController>(ReqResolverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
