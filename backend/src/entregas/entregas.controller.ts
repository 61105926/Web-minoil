import { Controller, Get, Query, Req, UseGuards, Inject } from '@nestjs/common';
import { Request } from 'express';
import { MobileJwtGuard } from '../mobile-auth/mobile-jwt.guard';
import { EntregasService } from './entregas.service';

@Controller('api/v1/mobile/entregas')
@UseGuards(MobileJwtGuard)
export class EntregasController {
  constructor(
    @Inject(EntregasService) private service: EntregasService,
  ) {}

  @Get()
  getEntregas(@Req() req: Request, @Query('fecha') fecha?: string) {
    const user  = (req as any).user;
    const login = user?.login ?? '';
    const hoy   = new Date().toISOString().split('T')[0];
    return this.service.getEntregasPorFecha(login, fecha ?? hoy);
  }
}
