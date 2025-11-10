import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

@Controller()
export class SpaController {
  // Usar @All en lugar de @Get para que sea el último en procesarse
  // Las rutas específicas (/auth, /empleados, /database) tendrán prioridad
  @All('*')
  serveSpa(@Req() req: Request, @Res() res: Response) {
    // Solo servir index.html para rutas del SPA (las rutas de API ya fueron procesadas)
    const publicPath = join(__dirname, '..', 'public');
    res.sendFile(join(publicPath, 'index.html'));
  }
}

