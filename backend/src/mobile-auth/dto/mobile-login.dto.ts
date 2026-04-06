import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class MobileLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  login: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  imei: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  version?: string;
}
