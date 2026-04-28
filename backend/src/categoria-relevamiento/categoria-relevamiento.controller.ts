import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriaRelevamientoService } from './categoria-relevamiento.service';

@Controller('api/v1/categoria-relevamiento')
@UseGuards(JwtAuthGuard)
export class CategoriaRelevamientoController {
  constructor(private service: CategoriaRelevamientoService) {}

  @Get('productos')
  getProductos() {
    return this.service.getProductosPropios();
  }

  @Get('trade-items')
  getTradeItems() {
    return this.service.getTradeItems();
  }

  @Get('player-sap')
  getPlayerSap(@Query('itemCode') itemCode: string) {
    return this.service.getPlayerSap(itemCode);
  }

  @Post('player-sap')
  upsertPlayerSap(@Body() body: any) {
    return this.service.upsertPlayerSap(body);
  }

  @Get('tareas')
  getTareas() {
    return this.service.getTareas();
  }

  @Post('tareas')
  createTarea(@Body() body: any, @Request() req: any) {
    const usuario = (req.user?.username ?? req.user?.empId ?? 'user').substring(0, 10);
    return this.service.createTarea({ ...body, usuario, activo: 1 });
  }

  @Delete('tareas/:itemCode/:fecha')
  deleteTarea(@Param('itemCode') itemCode: string, @Param('fecha') fecha: string) {
    return this.service.deleteTarea(itemCode, fecha);
  }

  @Post('trade-items')
  createTradeItem(@Body() body: any) {
    return this.service.createTradeItem(body);
  }

  @Put('trade-items/:codigo')
  updateTradeItem(@Param('codigo') codigo: string, @Body() body: any) {
    return this.service.updateTradeItem(codigo, body);
  }

  @Delete('trade-items/:codigo')
  deleteTradeItem(@Param('codigo') codigo: string) {
    return this.service.deleteTradeItem(codigo);
  }
}
