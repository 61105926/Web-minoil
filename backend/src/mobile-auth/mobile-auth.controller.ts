import { Controller, Post, Body, BadRequestException, Inject } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import { MobileLoginDto } from './dto/mobile-login.dto';

@Controller('api/v1/mobile/auth')
export class MobileAuthController {
  constructor(@Inject(MobileAuthService) private readonly mobileAuthService: MobileAuthService) {}

  @Post('login')
  async login(@Body() dto: MobileLoginDto) {
    if (!dto?.login || !dto?.password || !dto?.imei) {
      throw new BadRequestException('login, password e imei son requeridos')
    }
    return this.mobileAuthService.login(dto);
  }
}
