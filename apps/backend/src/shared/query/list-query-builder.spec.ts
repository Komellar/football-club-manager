import { Repository } from 'typeorm';
import { ListQueryBuilder } from './list-query-builder';
import { CompareOperator, FilterMode } from '@repo/core';

// Mock TypeORM operators
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  ILike: jest.fn((value) => ({ _type: 'ilike', _value: value })),
  In: jest.fn((value) => ({ _type: 'in', _value: value })),
  Not: jest.fn((value) => ({ _type: 'not', _value: value })),
  MoreThan: jest.fn((value) => ({ _type: 'moreThan', _value: value })),
  LessThan: jest.fn((value) => ({ _type: 'lessThan', _value: value })),
  MoreThanOrEqual: jest.fn((value) => ({
    _type: 'moreThanOrEqual',
    _value: value,
  })),
  LessThanOrEqual: jest.fn((value) => ({
    _type: 'lessThanOrEqual',
    _value: value,
  })),
  Between: jest.fn((min, max) => ({
    _type: 'between',
    _value: [min, max],
  })),
  Equal: jest.fn((value) => ({ _type: 'equal', _value: value })),
  And: jest.fn((...conditions) => ({ _type: 'and', _conditions: conditions })),
}));

// Mock entity for testing
interface TestEntity {
  id: number;
  name: string;
  age: number;
  email: string;
}

describe('ListQueryBuilder', () => {
  let mockRepository: jest.Mocked<Repository<TestEntity>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      findAndCount: jest.fn(),
    } as any;
  });

  describe('executeQuery', () => {
    it('should return paginated results with default pagination', async () => {
      // Arrange
      const mockData = [
        { id: 1, name: 'John', age: 25, email: 'john@test.com' },
        { id: 2, name: 'Jane', age: 30, email: 'jane@test.com' },
      ];
      mockRepository.findAndCount.mockResolvedValue([mockData, 2]);

      // Act
      const result = await ListQueryBuilder.executeQuery(mockRepository);

      // Assert
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should handle custom pagination', async () => {
      // Arrange
      const mockData = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `User${i + 1}`,
        age: 20 + i,
        email: `user${i + 1}@test.com`,
      }));
      mockRepository.findAndCount.mockResolvedValue([mockData, 25]);

      const queryDto = { page: 3, limit: 5 };

      // Act
      const result = await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
      );

      // Assert
      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 25,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 10, // (3-1) * 5
        take: 5,
      });
    });

    it('should apply simple filters', async () => {
      // Arrange
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
      const queryDto = { where: { name: 'John', age: 25 } };

      // Act
      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      // Assert
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: { _type: 'ilike', _value: '%John%' }, // Default PARTIAL mode
          age: { _type: 'equal', _value: 25 }, // Numbers use Equal()
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Comparison Operators', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should handle greater than operator', async () => {
      const queryDto = { where: { age: { [CompareOperator.GT]: 18 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'moreThan', _value: 18 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle less than operator', async () => {
      const queryDto = { where: { age: { [CompareOperator.LT]: 65 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'lessThan', _value: 65 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle greater than or equal operator', async () => {
      const queryDto = { where: { age: { [CompareOperator.GTE]: 18 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'moreThanOrEqual', _value: 18 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle less than or equal operator', async () => {
      const queryDto = { where: { age: { [CompareOperator.LTE]: 65 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'lessThanOrEqual', _value: 65 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle not equal operator', async () => {
      const queryDto = { where: { age: { [CompareOperator.NE]: 25 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'not', _value: 25 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle array values with IN operator', async () => {
      const queryDto = {
        where: { age: { [CompareOperator.EQ]: [18, 25, 30] } },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'in', _value: [18, 25, 30] } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle array values with NOT IN operator', async () => {
      const queryDto = {
        where: { age: { [CompareOperator.NE]: [18, 25, 30] } },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          age: { _type: 'not', _value: { _type: 'in', _value: [18, 25, 30] } },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Multiple Operators', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should handle multiple operators on same field with AND logic', async () => {
      const queryDto = {
        where: {
          age: {
            [CompareOperator.GTE]: 18,
            [CompareOperator.LT]: 65,
          },
        },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          age: {
            _type: 'and',
            _conditions: [
              { _type: 'moreThanOrEqual', _value: 18 },
              { _type: 'lessThan', _value: 65 },
            ],
          },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle single operator without AND wrapper', async () => {
      const queryDto = { where: { age: { [CompareOperator.GTE]: 18 } } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { age: { _type: 'moreThanOrEqual', _value: 18 } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Filter Modes', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should apply PARTIAL mode by default', async () => {
      const queryDto = { where: { name: 'John' } };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: { _type: 'ilike', _value: '%John%' } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should apply EXACT mode when specified', async () => {
      const queryDto = { where: { name: 'John' } };
      const filterOptions = {
        filterModes: { name: FilterMode.EXACT },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: { _type: 'equal', _value: 'John' } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should apply default filter mode from options', async () => {
      const queryDto = {
        where: { name: 'John', email: 'john@test.com' },
      };
      const filterOptions = {
        defaultFilterMode: FilterMode.EXACT,
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: { _type: 'equal', _value: 'John' },
          email: { _type: 'equal', _value: 'john@test.com' },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should ignore specified filters', async () => {
      const queryDto = {
        where: { name: 'John', age: 25, email: 'john@test.com' },
      };
      const filterOptions = {
        ignoredFilters: ['age'],
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: { _type: 'ilike', _value: '%John%' },
          age: { _type: 'equal', _value: 25 }, // Numbers use Equal()
          email: { _type: 'ilike', _value: '%john@test.com%' },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should apply search across multiple fields', async () => {
      const queryDto = { search: 'test' };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name', 'email'],
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          { name: { _type: 'ilike', _value: '%test%' } },
          { email: { _type: 'ilike', _value: '%test%' } },
        ],
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should combine search with existing filters', async () => {
      const queryDto = { where: { age: 25 }, search: 'John' };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name', 'email'],
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          {
            age: { _type: 'equal', _value: 25 }, // Numbers use Equal()
            name: { _type: 'ilike', _value: '%John%' },
          },
          {
            age: { _type: 'equal', _value: 25 }, // Numbers use Equal()
            email: { _type: 'ilike', _value: '%John%' },
          },
        ],
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should use EXACT search mode when specified', async () => {
      const queryDto = { search: 'test' };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name'],
          searchMode: FilterMode.EXACT,
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [{ name: 'test' }],
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should prevent search conflicts with existing filters', async () => {
      const queryDto = { where: { name: 'John' }, search: 'test' };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name', 'email'], // name conflicts with filter
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      // Should only search on email, not name (conflict prevention)
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: [
          {
            name: { _type: 'ilike', _value: '%John%' },
            email: { _type: 'ilike', _value: '%test%' },
          },
        ],
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should return original where when all search fields have conflicts', async () => {
      const queryDto = {
        where: { name: 'John', email: 'john@test.com' },
        search: 'test',
      };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name', 'email'], // Both fields have conflicts
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      // Should return original filters without search
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: { _type: 'ilike', _value: '%John%' },
          email: { _type: 'ilike', _value: '%john@test.com%' },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should ignore search when no search term provided', async () => {
      const queryDto = { where: { name: 'John' } };
      const filterOptions = {
        searchOptions: {
          searchFields: ['name', 'email'],
        },
      };

      await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
        filterOptions,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: { _type: 'ilike', _value: '%John%' } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Nested Filters', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should flatten nested filter objects', async () => {
      const queryDto = {
        where: {
          user: {
            profile: {
              name: 'John',
            },
          },
        },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          'user.profile.name': { _type: 'ilike', _value: '%John%' },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle nested objects with comparison operators', async () => {
      const queryDto = {
        where: {
          user: {
            age: { [CompareOperator.GTE]: 18 },
          },
        },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          'user.age': { _type: 'moreThanOrEqual', _value: 18 },
        },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should handle null and undefined values', async () => {
      const queryDto = {
        where: { name: 'John', age: null, email: undefined },
      };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: { _type: 'ilike', _value: '%John%' } },
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty query object', async () => {
      await ListQueryBuilder.executeQuery(mockRepository, {});

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: undefined,
        skip: 0,
        take: 10,
      });
    });

    it('should handle zero page and limit', async () => {
      const queryDto = { page: 0, limit: 0 };

      await ListQueryBuilder.executeQuery(mockRepository, queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: undefined,
        skip: 0, // Uses default page (1) when 0: (1-1) * 10 = 0
        take: 10, // Uses default limit when 0
      });
    });
  });

  describe('Pagination Calculation', () => {
    beforeEach(() => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);
    });

    it('should calculate pagination correctly for first page', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 25]);
      const queryDto = { page: 1, limit: 10 };

      const result = await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
      );

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should calculate pagination correctly for middle page', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 25]);
      const queryDto = { page: 2, limit: 10 };

      const result = await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should calculate pagination correctly for last page', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 25]);
      const queryDto = { page: 3, limit: 10 };

      const result = await ListQueryBuilder.executeQuery(
        mockRepository,
        queryDto,
      );

      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });
  });
});
