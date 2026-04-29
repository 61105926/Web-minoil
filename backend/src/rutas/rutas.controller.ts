import { Controller, Get, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RutasService } from './rutas.service';

@Controller('api/v1/mobile/rutas')
@UseGuards(JwtAuthGuard)
export class RutasController {
  constructor(
    @Inject(RutasService) private service: RutasService,
  ) {}

  @Get()
  getRutas(@Query('sucursal') sucursal?: string) {
    return this.service.getRutas(sucursal);
  }

  @Get(':ruta/clientes')
  getClientesPorRuta(@Param('ruta') ruta: string) {
    return this.service.getClientesPorRuta(ruta);
  }
}
