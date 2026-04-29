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
    // Nunca servir HTML para rutas de API
    if (req.path.startsWith('/api') || req.path.startsWith('/salas') || req.path.startsWith('/productos')) {
      return res.status(404).json({ message: 'Not found', path: req.path });
    }

    const publicPath = join(__dirname, '..', 'public');
    const indexPath = join(publicPath, 'index.html');

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

