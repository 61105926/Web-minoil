import { Controller, Get, Header, Inject } from '@nestjs/common';
import { SurveyService } from './survey.service';

// Ruta pública: no usa JwtAuthGuard ni Keycloak.
@Controller('survey')
export class SurveyController {
  constructor(@Inject(SurveyService) private readonly service: SurveyService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  getSurvey() {
    return this.service.getSurvey();
  }
}
