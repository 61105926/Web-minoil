import { Module } from '@nestjs/common';
import { BoletasModule } from '../boletas/boletas.module';
import { SurveyModule } from '../survey/survey.module';
import { VacacionesModule } from '../vacaciones/vacaciones.module';
import { LegacyApiController } from './legacy-api.controller';
import { LegacyApiService } from './legacy-api.service';

@Module({
  imports: [BoletasModule, VacacionesModule, SurveyModule],
  controllers: [LegacyApiController],
  providers: [LegacyApiService],
})
export class LegacyApiModule {}
