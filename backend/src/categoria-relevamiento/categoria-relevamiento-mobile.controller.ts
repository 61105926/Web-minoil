import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { MobileJwtGuard } from '../mobile-auth/mobile-jwt.guard';
import { CategoriaRelevamientoService } from './categoria-relevamiento.service';

/**
 * GET /api/v1/mobile/categoria-relevamiento/programacion
 *   ?cartera=1   (opcional — filtra por cartera)
 *
 * Retorna las tareas activas cuya fechaini <= HOY <= fechafin.
 * Respuesta por producto:
 * [
 *   {
 *     itemCode: "101069",
 *     itemName: "CARBONELL EXTRA VIRGEN PET 2 L",
 *     fechaini: "2026-04-28",
 *     fechafin: "2026-04-30",
 *     cartera: 0,
 *     players: [
 *       { codigo: "P1", nombre: "ACEITE OLVIA ESPANOLA EXT VIRG 2 LT" },
 *       { codigo: "P2", nombre: "ACEITE OLIVA FRAGATA ORUJO PET 2LT" }
 *     ]
 *   }
 * ]
 */
@Controller('api/v1/mobile/categoria-relevamiento')
@UseGuards(MobileJwtGuard)
export class CategoriaRelevamientoMobileController {
  constructor(
    @Inject(CategoriaRelevamientoService) private service: CategoriaRelevamientoService,
  ) {}

  @Get('programacion')
  async getProgramacion(@Query('cartera') cartera?: string) {
    const carteraNum = cartera != null && cartera !== '' ? parseInt(cartera, 10) : undefined;
    const tareas = await this.service.getTareasActivas(carteraNum);

    return tareas.map(t => ({
      itemCode: t.itemCode,
      itemName: t.itemName,
      fecha:    t.fecha,
      fechaini: t.fechaini,
      fechafin: t.fechafin,
      cartera:  t.cartera,
      activo:   t.activo,
      players:  [
        t.players1 && t.players1 !== '0' ? { codigo: t.players1, nombre: t.nombrePlayer1 ?? t.players1 } : null,
        t.players2 && t.players2 !== '0' ? { codigo: t.players2, nombre: t.nombrePlayer2 ?? t.players2 } : null,
        t.players3 && t.players3 !== '0' ? { codigo: t.players3, nombre: t.nombrePlayer3 ?? t.players3 } : null,
      ].filter(Boolean),
    }));
  }

  @Get('players')
  getPlayers(@Query('itemCode') itemCode: string) {
    return this.service.getPlayerSap(itemCode);
  }

  @Get('trade-items')
  getTradeItems() {
    return this.service.getTradeItems();
  }

  @Get('tareas')
  async getTareas(@Query('cartera') cartera?: string) {
    const carteraNum = cartera != null && cartera !== '' ? parseInt(cartera, 10) : undefined;
    const tareas = await this.service.getTareas();

    const filtradas = carteraNum != null
      ? tareas.filter(t => t.cartera === carteraNum)
      : tareas;

    return filtradas.map(t => ({
      itemCode: t.itemCode,
      itemName: t.itemName,
      fecha:    t.fecha,
      fechaini: t.fechaini,
      fechafin: t.fechafin,
      cartera:  t.cartera,
      activo:   t.activo,
      players: [
        t.players1 && t.players1 !== '0' ? { codigo: t.players1, nombre: t.nombrePlayer1 ?? t.players1 } : null,
        t.players2 && t.players2 !== '0' ? { codigo: t.players2, nombre: t.nombrePlayer2 ?? t.players2 } : null,
        t.players3 && t.players3 !== '0' ? { codigo: t.players3, nombre: t.nombrePlayer3 ?? t.players3 } : null,
      ].filter(Boolean),
    }));
  }
}
