import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';

// Las rutas HTTP están en LegacyApiController (compatibles con Laravel).
@Module({ providers: [VacacionesService], exports: [VacacionesService] })
export class VacacionesModule {}
