import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class SpaController {
  // Usar @Get('*') en lugar de @All('*') para solo capturar peticiones GET
  // Esto evita que intercepte peticiones POST, PUT, DELETE del backend
  // Las rutas del backend (POST /auth/login, etc.) serán manejadas por sus controladores
  @Get('*')
  serveSpa(@Req() req: Request, @Res() res: Response) {
    // Rutas del backend que NO deben ser capturadas por el SPA
    const backendRoutes = ['/auth', '/empleados', '/salas', '/productos', '/database'];
    const isBackendRoute = backendRoutes.some(route => req.path.startsWith(route));
    
    // Si es una ruta del backend, no debería llegar aquí, pero por seguridad retornamos 404
    if (isBackendRoute) {
      return res.status(404).json({ 
        message: `Cannot GET ${req.path}`,
        error: 'Not Found',
        statusCode: 404 
      });
    }
    
    // Solo servir index.html para rutas GET del SPA (las rutas de API ya fueron procesadas)
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

