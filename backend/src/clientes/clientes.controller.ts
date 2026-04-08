import { Controller, Get, Query, UseGuards, Inject, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/mobile/clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(
    @Inject(ClientesService) private clientesService: ClientesService
  ) {}

  @Get()
  async findByCity(
    @Query('city_id', new DefaultValuePipe(1), ParseIntPipe) cityId: number
  ) {
    return this.clientesService.findByCity(cityId);
  }
}
