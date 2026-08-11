// 
import { IsIn, IsOptional, IsNumber, IsString } from 'class-validator';

export const ESTIMATE_STATUSES = ['draft', 'in_review', 'approved', 'in_progress', 'closed'] as const;
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export class UpdateEstimateDto {
  @IsOptional() @IsString() name?: string;

  @IsOptional() @IsIn(ESTIMATE_STATUSES) status?: EstimateStatus;

  @IsOptional() @IsNumber() vat_rate?: number;

  @IsOptional() @IsIn(['on_top', 'included', 'none']) vat_mode?: 'on_top' | 'included' | 'none';
}
