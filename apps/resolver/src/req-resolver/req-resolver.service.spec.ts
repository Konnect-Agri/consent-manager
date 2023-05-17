import { Test, TestingModule } from '@nestjs/testing';
import { ReqResolverService } from './req-resolver.service';

describe('ReqResolverService', () => {
  let service: ReqResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReqResolverService],
    }).compile();

    service = module.get<ReqResolverService>(ReqResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
