import { Body, Controller, Post, Get, Delete, Param, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReemplazoCervezaService, type CrearReemplazoCervezaDto } from './reemplazo-cerveza.service';

@Controller('reemplazo-cerveza')
@UseGuards(JwtAuthGuard)
export class ReemplazoCervezaController {
  constructor(
    @Inject(ReemplazoCervezaService) private reemplazoCervezaService: ReemplazoCervezaService,
  ) { }

  @Post()
  async crearReemplazo(@Body() body: CrearReemplazoCervezaDto) {
    return await this.reemplazoCervezaService.crearReemplazo(body);
  }

  @Get('test-columns')
  async testColumns() {
    return await this.reemplazoCervezaService.getTestColumns();
  }

  @Get('sala/:cardCode')
  async getRegistrosPorSala(@Param('cardCode') cardCode: string) {
    return await this.reemplazoCervezaService.getRegistrosPorSala(cardCode);
  }

  @Delete(':id')
  async eliminarRegistro(@Param('id') id: string) {
    return await this.reemplazoCervezaService.eliminarRegistro(Number(id));
  }
}

