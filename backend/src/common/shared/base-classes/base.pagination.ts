import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BasePaginationDto {
  @ApiProperty({
    description: 'The page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number = 10;

  @ApiProperty({
    description: 'The field to sort by',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort: string = 'createdAt';

  @ApiProperty({
    description: 'The order to sort by',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'The search query',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  search: string = '';

  @ApiProperty({
    description: 'The fields and values to filter by',
    example: 'name:John Doe,age:30',
    required: false,
  })
  @IsOptional()
  @IsString()
  filter: string = '';

  @ApiProperty({
    description: 'The fields to select',
    example: '_id,createdAt,updatedAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  select: string = '';

  @ApiProperty({
    description: 'The from date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @ApiProperty({
    description: 'The to date',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate: Date;

  @ApiProperty({
    description: 'The fields to select',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateField: string = 'createdAt';

  get skip() {
    return (this.page - 1) * this.limit;
  }

  get orderQuery() {
    return { [this.sort]: this.order };
  }

  get orderAggQuery() {
    return { [this.sort]: this.order == 'asc' ? 1 : -1 };
  }

  get filterQuery() {
    return this.filter
      ? this.filter.split(',').reduce((acc, field) => {
          const [key, value] = field.split(':');
          return { ...acc, [key]: value };
        }, {})
      : {};
  }

  get selectFields() {
    return this.select
      ? this.select
          .split(',')
          .reduce((acc, field) => ({ ...acc, [field]: 1 }), {})
      : {};
  }

  get dateFilterQuery() {
    if (this.fromDate && this.toDate && this.dateField) {
      // set the from date to the start of the day
      const fromDate = new Date(this.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      // set the to date to the end of the day
      const toDate = new Date(this.toDate);
      toDate.setHours(23, 59, 59, 999);
      return { [this.dateField]: { $gte: fromDate, $lte: toDate } };
    }

    if (this.fromDate && this.dateField) {
      // set the from date to the start of the day
      const fromDate = new Date(this.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      return { [this.dateField]: { $gte: fromDate } };
    }

    if (this.toDate && this.dateField) {
      // set the to date to the end of the day
      const toDate = new Date(this.toDate);
      toDate.setHours(23, 59, 59, 999);
      return { [this.dateField]: { $lte: toDate } };
    }

    return {};
  }
}
