import { Controller, Get, Post, Body, UseGuards, Request, Param, Query, Inject, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductosService } from './productos.service';
import { StockSurveyDto } from './dto/stock-survey.dto';

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(
    @Inject(ProductosService) private productosService: ProductosService,
  ) { }

  @Get('cervezas')
  async getCervezas() {
    return await this.productosService.getCervezas();
  }

  @Get('sala/:cardCode')
  async getProductosPorSala(
    @Param('cardCode') cardCode: string,
    @Query('tipo') tipo: string,
    @Request() req: any,
  ) {
    return await this.productosService.getProductosPorSala(cardCode, tipo);
  }
}

@Controller('api/v1/productos')
@UseGuards(JwtAuthGuard)
export class ProductosMobileController {
  constructor(
    @Inject(ProductosService) private productosService: ProductosService,
  ) { }

  @Get()
  async getProductos() {
    const products = await this.productosService.getProductosMobile();
    return { products };
  }

  @Get('unidades')
  async getUnidades(@Query('item') item: string) {
    if (!item) {
      return { success: false, message: 'El parámetro item es requerido.' };
    }
    const data = await this.productosService.getUnidadesMedida(item);
    return { success: true, data };
  }

  @Post('stock-survey')
  async recordStockSurvey(@Body() dto: StockSurveyDto, @Request() req: any) {
    const usrCreate = dto.empId != null
      ? String(dto.empId)
      : (req.user?.username ?? req.user?.userId ?? 'unknown');

    const payload = { ...dto, usrCreate };

    try {
      await this.productosService.recordStockSurvey(payload);
      return { message: 'Stock survey recorded successfully.' };
    } catch (error: any) {
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Error al insertar en HANA',
          hanaError: error.message ?? String(error),
          payload,
        },
        400,
      );
    }
  }
}

