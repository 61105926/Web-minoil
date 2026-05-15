import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MobileJwtGuard } from '../mobile-auth/mobile-jwt.guard';
import { RelevamientoService } from './relevamiento.service';
import { GuardarRelevamientoDto } from './dto/guardar-relevamiento.dto';

@Controller('api/v1/mobile/relevamiento')
@UseGuards(MobileJwtGuard)
export class RelevamientoController {
  constructor(private readonly service: RelevamientoService) {}

  // POST /api/v1/mobile/relevamiento
  @Post()
  async guardar(@Body() dto: GuardarRelevamientoDto, @Request() req: any) {
    await this.service.guardar(dto, req.user.idEmpleado);
    return {
      success:   true,
      message:   'Relevamiento guardado',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /api/v1/mobile/relevamiento/historial?cardCode=C000001
  @Get('historial')
  historial(@Query('cardCode') cardCode: string) {
    return this.service.getHistorial(cardCode);
  }

  // GET /api/v1/mobile/relevamiento/mi-dia
  @Get('mi-dia')
  miDia(@Request() req: any) {
    return this.service.getMiDia(req.user.idEmpleado);
  }
}
