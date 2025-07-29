import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return sanitized user if found', async () => {
      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
        password: 'hashedpassword',
        hashedRefreshToken: 'token123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });

      expect(result).toEqual({
        id: 'user123',
        email: 'john@example.com',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('hashedRefreshToken');
    });

    it('should throw CustomError if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('nonexistent')).rejects.toThrow(
        new CustomError('User not found', 404, 'UserNotFound'),
      );
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password and hashedRefreshToken fields', () => {
      const rawUser = {
        id: 'user1',
        email: 'user@example.com',
        password: 'secret',
        hashedRefreshToken: 'refreshToken',
      };

      const result = service.sanitizeUser(rawUser);

      expect(result).toEqual({
        id: 'user1',
        email: 'user@example.com',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('hashedRefreshToken');
    });
  });
});
