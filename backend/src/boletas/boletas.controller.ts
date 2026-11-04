import { Controller, Get, Header, Inject, Query, StreamableFile } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { renderBoletaPdf } from './boleta-pdf';
import { BoletasService } from './boletas.service';

@Controller('boletas')
export class BoletasController {
  constructor(@Inject(BoletasService) private readonly service: BoletasService) {}

  @Get('meses')
  @Header('Cache-Control', 'no-store')
  getMonths(@Query('numero') numero: string) {
    return this.service.getMonths(numero);
  }

  @Get('pdf')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async getPdf(@Query('numero') numero: string, @Query('fecha') fecha: string) {
    const record = await this.service.getBoleta(numero, fecha);
    const logo = readFileSync(join(__dirname, '..', '..', 'assets', 'boleta-logo.png'));
    const pdf = renderBoletaPdf(record, logo);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="boleta-${fecha}.pdf"`,
      length: pdf.length,
    });
  }
}
