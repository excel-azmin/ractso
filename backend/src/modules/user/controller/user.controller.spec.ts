import { BasePaginationDto } from '@/common/shared/base-classes/base.pagination';
import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserListQuery } from '../query/user-list/user-list.query';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserList', () => {
    it('should call QueryBus.execute with GetUserListQuery and return result', async () => {
      const query = {
        page: 1,
        limit: 10,
      } as BasePaginationDto;

      const expectedResponse = {
        data: [{ id: 'user1', firstName: 'John', email: 'john@example.com' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.getUserList(query);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetUserListQuery(query),
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
