import { Test, TestingModule } from '@nestjs/testing';
import { ReqCheckerService } from './req-checker.service';

describe('ReqCheckerService', () => {
  let service: ReqCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReqCheckerService],
    }).compile();

    service = module.get<ReqCheckerService>(ReqCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
