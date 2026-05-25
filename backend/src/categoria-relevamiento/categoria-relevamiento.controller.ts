import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriaRelevamientoService } from './categoria-relevamiento.service';

@Controller('api/v1/categoria-relevamiento')
@UseGuards(JwtAuthGuard)
export class CategoriaRelevamientoController {
  constructor(@Inject(CategoriaRelevamientoService) private service: CategoriaRelevamientoService) {}

  @Get('productos')
  getProductos() {
    return this.service.getProductosPropios();
  }

  @Get('trade-items')
  getTradeItems() {
    return this.service.getTradeItems();
  }

  @Get('player-sap')
  getPlayerSap(@Query('itemCode') itemCode?: string, @Query('canal') canal?: string) {
    if (itemCode) return this.service.getPlayerSap(itemCode, canal);
    return this.service.getAllPlayerSap();
  }

  @Post('player-sap')
  upsertPlayerSap(@Body() body: any) {
    return this.service.upsertPlayerSap(body);
  }

  @Delete('player-sap/:itemCode')
  deletePlayerSap(@Param('itemCode') itemCode: string, @Query('canal') canal?: string) {
    return this.service.deletePlayerSap(itemCode, canal);
  }

  @Post('player-sap/import')
  importPlayerSap(@Body() body: { items: any[] }) {
    return this.service.bulkUpsertPlayerSap(body.items ?? []);
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

  @Patch('tareas/:itemCode/:fecha')
  updateTarea(
    @Param('itemCode') itemCode: string,
    @Param('fecha') fecha: string,
    @Body() body: any,
  ) {
    return this.service.updateTarea(itemCode, fecha, body);
  }

  @Delete('tareas/:itemCode/:fecha')
  deleteTarea(@Param('itemCode') itemCode: string, @Param('fecha') fecha: string) {
    return this.service.deleteTarea(itemCode, fecha);
  }

  @Post('trade-items')
  createTradeItem(@Body() body: any) {
    return this.service.createTradeItem(body);
  }

  @Put('trade-items/:id')
  updateTradeItem(@Param('id') id: string, @Body() body: any) {
    return this.service.updateTradeItem(Number(id), body);
  }

  @Delete('trade-items/:id')
  deleteTradeItem(@Param('id') id: string) {
    return this.service.deleteTradeItem(Number(id));
  }

  @Post('trade-items/import')
  importTradeItems(@Body() body: { items: any[] }) {
    return this.service.bulkUpsertTradeItems(body.items ?? []);
  }
}
