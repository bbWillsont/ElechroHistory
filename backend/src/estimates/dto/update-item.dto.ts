// 
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateItemDto {
  @IsOptional() @IsNumber() @Min(0) quantity?: number;
  @IsOptional() @IsNumber() @Min(0) price_ozp?: number;
  @IsOptional() @IsNumber() @Min(0) price_emm?: number;
  @IsOptional() @IsNumber() @Min(0) price_mat?: number;
}
