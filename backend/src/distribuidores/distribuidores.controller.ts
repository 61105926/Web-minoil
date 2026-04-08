import { Controller, Get, Post, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { DistribuidoresService } from './distribuidores.service';
import { CreateDistribuidorDto } from './dto/create-distribuidor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/mobile/distribuidores')
@UseGuards(JwtAuthGuard)
export class DistribuidoresController {
  constructor(
    @Inject(DistribuidoresService) private distribuidoresService: DistribuidoresService,
  ) {}

  @Post()
  create(@Body() dto: CreateDistribuidorDto) {
    return this.distribuidoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.distribuidoresService.findAll();
  }

  @Put('ubicacion')
  updateUbicacion(
    @Body() body: { nombre: string; latitud: number; longitud: number },
  ) {
    return this.distribuidoresService.updateUbicacionPorNombre(body.nombre, body.latitud, body.longitud);
  }
}
