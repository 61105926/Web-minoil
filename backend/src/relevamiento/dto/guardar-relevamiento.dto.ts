import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemRelevamientoDto {
  @IsString()
  @IsNotEmpty()
  itemCode: string;

  @IsString()
  @IsNotEmpty()
  playerCodigo: string;

  @IsOptional()
  @IsNumber()
  precioPropio?: number;   // precio del producto Minoil en este punto

  @IsOptional()
  @IsBoolean()
  presenciaPropia?: boolean; // ¿el producto Minoil está en góndola?

  @IsOptional()
  @IsNumber()
  precio?: number;         // precio del competidor

  @IsOptional()
  @IsNumber()
  facing?: number;

  @IsOptional()
  @IsBoolean()
  presencia?: boolean;

  @IsOptional()
  @IsString()
  observacion?: string;
}

export class GuardarRelevamientoDto {
  @IsString()
  @IsNotEmpty()
  cardCode: string;

  @IsString()
  @IsNotEmpty()
  cardName: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRelevamientoDto)
  items: ItemRelevamientoDto[];
}
