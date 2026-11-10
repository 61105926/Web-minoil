import { Controller, Get, Header, HttpCode, Inject, Post, Req, StreamableFile } from '@nestjs/common';
import { Request } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { renderBoletaPdf } from '../boletas/boleta-pdf';
import { BoletasService } from '../boletas/boletas.service';
import { SurveyService } from '../survey/survey.service';
import { parseSolicitud, pdfFileName, renderVacacionPdf } from '../vacaciones/vacacion-pdf';
import { VacacionesService } from '../vacaciones/vacaciones.service';
import { LegacyApiService } from './legacy-api.service';

type Input = Record<string, any>;

/** Equivale a `$request->input()` de Laravel: query string y cuerpo, con prioridad del cuerpo. */
function input(req: Request): Input {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  return { ...(req.query as Input), ...body };
}

/**
 * Express 5 no interpreta `detalle[0][Desde]=...` en el query string. Reconstruye el arreglo
 * desde `detalle[i][Campo]`, `detalle[][Campo]` o un `detalle` enviado como JSON.
 */
export function detalleFromQuery(url: string): Input[] | undefined {
  const params = new URLSearchParams(url.split('?')[1] ?? '');
  const json = params.get('detalle');
  if (json) {
    try { return JSON.parse(json); } catch { return undefined; }
  }
  const items: Input[] = [];
  for (const [key, value] of params) {
    const match = key.match(/^detalle\[(\d*)\]\[(\w+)\]$/);
    if (!match) continue;
    const [, index, field] = match;
    if (index !== '') (items[Number(index)] ??= {})[field] = value;
    else {
      // Sin índice: un campo repetido abre el siguiente elemento.
      if (!items.length || field in items[items.length - 1]) items.push({});
      items[items.length - 1][field] = value;
    }
  }
  return items.length ? items.filter(Boolean) : undefined;
}

const asset = (name: string) => readFileSync(join(__dirname, '..', '..', 'assets', name));
const logo = () => asset('boleta-logo.png');
const vacacionLogo = () => asset('vacacion-logo.png');

function pdfFile(pdf: Buffer, fileName: string) {
  return new StreamableFile(pdf, { type: 'application/pdf', disposition: `inline; filename="${fileName}"`, length: pdf.length });
}

// Rutas compatibles con el antiguo routes/api.php de Laravel y, como alias, con los nombres que usa el
// frontend massive-message-whatsapp (/api/empleado/detalle, /api/estado, /api/sap, ...). Públicas: sin JwtAuthGuard ni Keycloak.
@Controller('api')
export class LegacyApiController {
  constructor(
    @Inject(BoletasService) private readonly boletas: BoletasService,
    @Inject(VacacionesService) private readonly vacaciones: VacacionesService,
    @Inject(SurveyService) private readonly survey: SurveyService,
    @Inject(LegacyApiService) private readonly service: LegacyApiService,
  ) {}

  // ---- Boletas ----

  @Get('dateConsult')
  @Header('Cache-Control', 'no-store')
  async dateConsult(@Req() req: Request) {
    const months = await this.boletas.getMonths(input(req).numero);
    return months.map(({ month, year }) => ({ month, year }));
  }

  @Get('boleta')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  async boleta(@Req() req: Request) {
    const { numero, fecha } = input(req);
    const record = await this.boletas.getBoleta(numero, fecha);
    return pdfFile(renderBoletaPdf(record, logo()), `boleta-${fecha}.pdf`);
  }

  // ---- Vacaciones ----

  @Get('vacacion')
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  solicitudVacacion(@Req() req: Request) {
    const data = input(req);
    if (!Array.isArray(data.detalle)) data.detalle = detalleFromQuery(req.originalUrl) ?? data.detalle;
    const solicitud = parseSolicitud(data);
    return pdfFile(renderVacacionPdf(solicitud, vacacionLogo()), pdfFileName(solicitud));
  }

  @Post('solicitud/pdf')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Header('X-Content-Type-Options', 'nosniff')
  solicitudVacacionPost(@Req() req: Request) {
    return this.solicitudVacacion(req);
  }

  @Get(['emp', 'empleado/detalle'])
  @Header('Cache-Control', 'no-store')
  getEmpleadoVacationData(@Req() req: Request) {
    return this.vacaciones.getEmpleadoVacationData(input(req).mobile);
  }

  @Get(['empleado/info', 'empleado'])
  @Header('Cache-Control', 'no-store')
  getEmpleadoData(@Req() req: Request) {
    return this.vacaciones.getEmpleadoData(input(req).emp_id);
  }

  @Post(['vacaciones/state', 'estado'])
  @HttpCode(200)
  actualizarEstado(@Req() req: Request) {
    return this.vacaciones.actualizarEstado(input(req));
  }

  @Post(['vacaciones/add-vacation', 'sap'])
  @HttpCode(200)
  addVacation(@Req() req: Request) {
    return this.vacaciones.addVacation(input(req));
  }

  @Get(['recomendar-reemplazante', 'reemplazante-recomendado'])
  @Header('Cache-Control', 'no-store')
  recomendarReemplazante(@Req() req: Request) {
    return this.vacaciones.recomendarReemplazante(input(req).empId);
  }

  @Get(['reemplazante-vacation', 'reemplazantes'])
  @Header('Cache-Control', 'no-store')
  reemplazanteVacation(@Req() req: Request) {
    return this.vacaciones.reemplazanteVacation(input(req).emp_id);
  }

  @Post(['vacaciones/reemplazante/guardar', 'reemplazante'])
  @HttpCode(200)
  guardarReemplazante(@Req() req: Request) {
    return this.vacaciones.guardarReemplazante(input(req));
  }

  @Post(['store-vacation', 'solicitud'])
  @HttpCode(200)
  storeVacationData(@Req() req: Request) {
    return this.vacaciones.storeVacationData(input(req));
  }

  @Get(['vacacion-data-manager', 'manager'])
  @Header('Cache-Control', 'no-store')
  getVacacionesPorManager(@Req() req: Request) {
    return this.vacaciones.getVacacionesPorManager(input(req).manager);
  }

  @Get(['vacacion-data-empleado', 'empleado/solicitudes'])
  @Header('Cache-Control', 'no-store')
  getVacacionesPorEmpleado(@Req() req: Request) {
    return this.vacaciones.getVacacionesPorEmpleado(input(req).emp_id);
  }

  // ---- Encuesta y clima laboral ----

  @Get('survey')
  @Header('Cache-Control', 'no-store')
  getSurvey() {
    return this.survey.getSurvey();
  }

  @Post('getUserStatus')
  @HttpCode(200)
  getUserStatus(@Req() req: Request) {
    return this.service.getUserStatus(input(req));
  }

  @Post('updateLogin')
  @HttpCode(200)
  updateLogin(@Req() req: Request) {
    return this.service.updateLogin(input(req));
  }

  @Post('updateFinished')
  @HttpCode(200)
  updateFinished(@Req() req: Request) {
    return this.service.updateFinished(input(req));
  }

  @Post('storeResponses')
  @HttpCode(200)
  storeResponses(@Req() req: Request) {
    return this.service.storeResponses(input(req));
  }

  @Get('climate-reponse')
  @Header('Cache-Control', 'no-store')
  climaResponse() {
    return this.service.climaResponse();
  }

  // ---- Inventario ----

  @Get('inventario')
  @Header('Cache-Control', 'no-store')
  inventory(@Req() req: Request) {
    const { fechai, fechaf } = input(req);
    return this.service.inventory(fechai, fechaf);
  }

  @Get('products-inventory')
  @Header('Cache-Control', 'no-store')
  drinkStock() {
    return this.service.drinkStock();
  }
}
