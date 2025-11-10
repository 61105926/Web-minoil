import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class SpaController {
  // Usar @Get('*') para capturar todas las rutas GET no manejadas por otros controladores
  // En NestJS, los controladores con rutas específicas tienen prioridad sobre @Get('*')
  // Por lo tanto, /salas será manejado por SalasController antes de llegar aquí
  @Get('*')
  serveSpa(@Req() req: Request, @Res() res: Response) {
    // Si llegamos aquí, significa que ninguna ruta del backend manejó esta petición GET
    // Por lo tanto, es seguro servir el index.html del SPA
    const publicPath = join(__dirname, '..', 'public');
    const indexPath = join(publicPath, 'index.html');
    
    // Verificar que el archivo existe antes de servirlo
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        message: 'Frontend no encontrado. Por favor, compila el frontend primero.',
        error: 'Not Found',
        statusCode: 404 
      });
    }
  }
}

