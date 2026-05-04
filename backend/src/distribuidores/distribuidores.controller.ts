import { Controller, Get, Post, Put, Body, Query, UseGuards, Inject } from '@nestjs/common';
import { DistribuidoresService } from './distribuidores.service';
import { CreateDistribuidorDto } from './dto/create-distribuidor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MobileJwtGuard } from '../mobile-auth/mobile-jwt.guard';

@Controller('api/v1/mobile/distribuidores')
export class DistribuidoresController {
  constructor(
    @Inject(DistribuidoresService) private distribuidoresService: DistribuidoresService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateDistribuidorDto) {
    return this.distribuidoresService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.distribuidoresService.findAll();
  }

  @Get('trayectoria')
  @UseGuards(JwtAuthGuard)
  getTrayectoria(
    @Query('nombre') nombre: string,
    @Query('fecha') fecha: string,
  ) {
    return this.distribuidoresService.getTrayectoria(nombre, fecha);
  }

  @Get('clientes-dia')
  @UseGuards(JwtAuthGuard)
  getClientesDia(
    @Query('nombre') nombre: string,
    @Query('fecha')  fecha?: string,
  ) {
    const hoy = new Date().toISOString().split('T')[0];
    return this.distribuidoresService.getClientesDia(nombre, fecha ?? hoy);
  }

  @Put('ubicacion')
  @UseGuards(MobileJwtGuard)
  updateUbicacion(
    @Body() body: { nombre: string; latitud: number; longitud: number },
  ) {
    return this.distribuidoresService.upsertUbicacion(body.nombre, body.latitud, body.longitud);
  }
}
