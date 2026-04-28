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
    const territorio = parseInt(req.user?.codeRegional ?? req.user?.territorio ?? '2', 10) || 2;
    console.log(`🔵 SalasController: Usuario ${req.user?.username}, regional=${req.user?.regional}, territorio=${territorio}`);
    
    const salas = await this.salasService.getSalasPorTerritorio(territorio);
    console.log(`✅ SalasController: Devolviendo ${salas.length} salas`);
    return salas;
  }
}

