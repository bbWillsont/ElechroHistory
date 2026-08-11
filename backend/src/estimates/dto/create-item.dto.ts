// 
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateItemDto {
  @IsOptional() @IsUUID() rate_id?: string;
  @IsOptional() @IsString() code?: string;

  @IsString() @IsNotEmpty() name: string;

  @IsString() unit: string;

  @IsNumber() @Min(0) quantity: number;

  @IsOptional() @IsNumber() @Min(0) price_ozp?: number;
  @IsOptional() @IsNumber() @Min(0) price_emm?: number;
  @IsOptional() @IsNumber() @Min(0) price_mat?: number;

  // НР/СП ограничиваем здравыми пределами (проверка по Постановлению №145)
  @IsOptional() @IsNumber() @Min(0) @Max(300) nr_rate?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(300) sp_rate?: number;
}
