import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getHealthStatus', () => {
    it('should return health status object', () => {
      const mockHealthStatus = {
        status: 'OK',
        timestamp: '2023-01-01T00:00:00.000Z',
        message: 'Backend is running smoothly',
      };

      jest
        .spyOn(appService, 'getHealthStatus')
        .mockReturnValue(mockHealthStatus);

      const result = appController.getHealthStatus();

      expect(result).toEqual(mockHealthStatus);
      expect(appService.getHealthStatus).toHaveBeenCalled();
    });

    it('should contain required properties', () => {
      const result = appController.getHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('message');

      expect(result.status).toBe('OK');
      expect(typeof result.timestamp).toBe('string');
      expect(result.message).toBe('Backend is running smoothly');
    });
  });
});
