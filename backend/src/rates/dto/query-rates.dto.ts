import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRatesDto {
  @IsOptional() @IsString() search?: string;

  @IsOptional() @Type(() => Number) @IsInt() catalogId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number = 50;
}
