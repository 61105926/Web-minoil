import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateDistribuidorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}
