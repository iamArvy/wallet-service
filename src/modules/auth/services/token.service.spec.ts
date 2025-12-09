import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

const mockJwtService = () => ({
  signAsync: jest.fn(),
});

describe('TokenService', () => {
  let service: TokenService;
  // let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('generate', () => {
  //   it('should call jwtService', async () => {
  //     jwtService.signAsync.mockRejectedValue('token');
  //     await expect(jwtService.signAsync).toHaveBeenCalled();
  //   });
  // });
});
