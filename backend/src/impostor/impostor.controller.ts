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
  async insertarStock(@Body() body: { datos: ImpostorStockData[] }, @Request() req: any) {
    try {
      console.log(`🔵 ImpostorController: Usuario ${req.user?.username} insertando ${body.datos?.length || 0} registros`);
      
      if (!body.datos || body.datos.length === 0) {
        throw new Error('No se proporcionaron datos para insertar');
      }

      console.log(`🔵 Datos recibidos:`, JSON.stringify(body.datos.slice(0, 2), null, 2));

      await this.impostorService.insertarStockProductoLoteBatch(body.datos);
      
      return {
        success: true,
        message: `${body.datos.length} registros insertados correctamente`,
        registrosInsertados: body.datos.length,
      };
    } catch (error: any) {
      console.error('❌ Error en ImpostorController:', error);
      console.error('❌ Stack:', error.stack);
      throw error;
    }
  }
}

