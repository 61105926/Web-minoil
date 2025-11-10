import { Controller, Get, UseGuards, Request, Param, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductosService } from './productos.service';

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(
    @Inject(ProductosService) private productosService: ProductosService,
  ) {}

  @Get('sala/:cardCode')
  async getProductosPorSala(
    @Param('cardCode') cardCode: string,
    @Request() req: any,
  ) {
    return await this.productosService.getProductosPorSala(cardCode);
  }
}

