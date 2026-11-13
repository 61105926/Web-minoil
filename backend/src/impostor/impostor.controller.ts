import { Body, Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImpostorService, ImpostorStockData } from './impostor.service';

@Controller('impostor')
@UseGuards(JwtAuthGuard)
export class ImpostorController {
  constructor(@Inject(ImpostorService) private impostorService: ImpostorService) {}

  /**
   * Guarda un conteo completo. `conteoId` lo genera el cliente por conteo: si el mismo
   * conteo se reenvía (p. ej. reintento tras perder la respuesta) no se duplican filas.
   */
  @Post('stock')
  async insertarStock(
    @Body() body: { datos: ImpostorStockData[]; regional?: string; conteoId?: string },
    @Request() req: any,
  ) {
    const empleado = req.user?.fullName || req.user?.username || 'desconocido';
    const regional = req.user?.regional || body?.regional || null;
    const datos = Array.isArray(body?.datos) ? body.datos.map((d) => ({ ...d, regional, empleado })) : [];
    const conteoId = typeof body?.conteoId === 'string' ? body.conteoId.slice(0, 64) : undefined;

    const { duplicado } = await this.impostorService.insertarStock(datos, conteoId);

    return {
      success: true,
      message: duplicado
        ? 'Este conteo ya estaba guardado'
        : `${datos.length} registros insertados correctamente`,
      registrosInsertados: duplicado ? 0 : datos.length,
      duplicado,
      empleado,
      regional,
    };
  }
}
