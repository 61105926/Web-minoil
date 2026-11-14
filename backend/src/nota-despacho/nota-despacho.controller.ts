import { Controller, Get, Header, Inject, Param, Query, StreamableFile } from '@nestjs/common';
import { renderNotaDespachoPdf } from './nota-despacho-pdf';
import { NotaDespachoService } from './nota-despacho.service';

// Ruta pública: no usa JwtAuthGuard ni Keycloak. Solo requiere el CUF de la factura.
@Controller('api/nota-despacho')
export class NotaDespachoController {
  constructor(@Inject(NotaDespachoService) private readonly service: NotaDespachoService) {}

  /** GET /api/nota-despacho/:cuf  o  GET /api/nota-despacho?cuf=... → PDF R-199 */
  @Get([':cuf', ''])
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async pdf(@Param('cuf') cufParam?: string, @Query('cuf') cufQuery?: string) {
    const { cabecera, lineas } = await this.service.obtener(cufParam || cufQuery);
    const pdf = renderNotaDespachoPdf(cabecera, lineas);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="NotaDespacho_${cabecera.DocNum}.pdf"`,
      length: pdf.length,
    });
  }
}
