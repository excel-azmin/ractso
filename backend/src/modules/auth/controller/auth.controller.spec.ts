import { User } from '@clerk/backend';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegistrationAuthDto } from '../dto/registration-auth.dto';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /v1/auth/clerk/sync', () => {
    it('should call commandBus.execute with RegistrationCommand', async () => {
      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
      } as unknown as User;

      await controller.authClerk(mockUser);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationAuthDto: mockUser,
        }),
      );
    });
  });

  describe('POST /v1/auth/register', () => {
    it('should call commandBus.execute with RegistrationCommand', async () => {
      const registrationDto: RegistrationAuthDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'securepass',
      };

      await controller.register(registrationDto);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          registrationAuthDto: registrationDto,
        }),
      );
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should call commandBus.execute with LoginCommand', async () => {
      const loginDto: LoginAuthDto = {
        email: 'john@example.com',
        password: 'securepass',
      };

      await controller.login(loginDto);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          loginAuthDto: loginDto,
        }),
      );
    });
  });

  describe('POST /v1/auth/logout', () => {
    it('should call commandBus.execute with LogoutCommand', async () => {
      const mockUser = { id: 'user_456' } as User;
      const mockRequest = {} as Request;

      await controller.logout(mockUser, mockRequest);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_456',
          request: mockRequest,
        }),
      );
    });
  });

  describe('POST /v1/auth/refresh-token', () => {
    it('should call commandBus.execute with RefreshTokenCommand', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token-abc',
      };

      await controller.refreshToken(refreshTokenDto);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          refreshTokenDto,
        }),
      );
    });
  });

  describe('GET /v1/auth/me', () => {
    it('should call queryBus.execute with GetMeQuery', async () => {
      const mockUser = { id: 'user_789' } as User;

      await controller.getMe(mockUser);
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_789',
        }),
      );
    });
  });
});
