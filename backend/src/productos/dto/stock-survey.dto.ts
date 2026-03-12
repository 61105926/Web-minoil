import { IsString, IsInt, IsBoolean, IsDateString, MaxLength, Min, IsOptional } from 'class-validator';

export class StockSurveyDto {
  @IsString()
  @MaxLength(10)
  cliente: string;

  @IsString()
  @MaxLength(10)
  producto: string;

  @IsString()
  @MaxLength(20)
  tipo: string;

  @IsInt()
  @Min(0)
  cantidad: number;

  @IsBoolean()
  bandeo: boolean;

  @IsDateString()
  fecha_vencimiento: string;

  @IsOptional()
  @IsInt()
  empId?: number;
}
