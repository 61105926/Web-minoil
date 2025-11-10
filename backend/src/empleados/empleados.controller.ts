import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('empleados')
@UseGuards(JwtAuthGuard)
export class EmpleadosController {
  constructor(
    @Inject(EmpleadosService) private empleadosService: EmpleadosService
  ) {}

  @Get()
  async findAll() {
    return this.empleadosService.findAll();
  }
}
