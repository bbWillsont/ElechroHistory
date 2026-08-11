// create-estimate.dto.ts
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEstimateDto {
  @IsUUID() project_id: string;

  @IsString() @IsNotEmpty() name: string;

  @IsOptional() @IsNumber() vat_rate?: number;

  @IsOptional() @IsIn(['on_top', 'included', 'none']) vat_mode?: 'on_top' | 'included' | 'none';
}
