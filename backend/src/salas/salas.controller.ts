import { Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalasService } from './salas.service';

@Controller('salas')
@UseGuards(JwtAuthGuard)
export class SalasController {
  constructor(
    @Inject(SalasService) private salasService: SalasService,
  ) {}

  @Get()
  async getSalas(@Request() req: any) {
    // Obtener territorio del usuario desde el token JWT
    const territorio = req.user?.territorio || 2; // Por defecto La Paz
    
    return await this.salasService.getSalasPorTerritorio(territorio);
  }
}

