import { Controller, Post, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImpostorService, ImpostorStockData } from './impostor.service';

@Controller('impostor')
@UseGuards(JwtAuthGuard)
export class ImpostorController {
  constructor(
    @Inject(ImpostorService) private impostorService: ImpostorService,
  ) {}

  @Post('stock')
  async insertarStock(
    @Body() body: { datos: ImpostorStockData[]; regional?: string },
    @Request() req: any,
  ) {
    if (!body.datos?.length) {
      throw new Error('No se proporcionaron datos para insertar');
    }

    const empleado = req.user?.fullName || req.user?.username || 'desconocido';
    const regional = req.user?.regional || body.regional || null;
    console.log(`🔵 ImpostorController: empleado=${empleado}, regional=${regional}, registros=${body.datos.length}`);

    const datosCompletos = body.datos.map(d => ({
      ...d,
      regional,
      empleado,
    }));

    await this.impostorService.insertarStock(datosCompletos);

    return {
      success: true,
      message: `${body.datos.length} registros insertados correctamente`,
      registrosInsertados: body.datos.length,
      empleado,
      regional,
    };
  }
}
