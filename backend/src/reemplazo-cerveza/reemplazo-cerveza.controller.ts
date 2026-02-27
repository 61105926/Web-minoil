import { Body, Controller, Post, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReemplazoCervezaService, type CrearReemplazoCervezaDto } from './reemplazo-cerveza.service';

@Controller('reemplazo-cerveza')
@UseGuards(JwtAuthGuard)
export class ReemplazoCervezaController {
  constructor(
    @Inject(ReemplazoCervezaService) private reemplazoCervezaService: ReemplazoCervezaService,
  ) {}

  @Post()
  async crearReemplazo(@Body() body: CrearReemplazoCervezaDto) {
    return await this.reemplazoCervezaService.crearReemplazo(body);
  }
}

