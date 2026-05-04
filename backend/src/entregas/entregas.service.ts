import { Injectable, Inject } from '@nestjs/common';
import { SqlServerService } from '../sqlserver/sqlserver.service';

export interface Entrega {
  id: number;
  fecha: string;
  estado: number;
  empleadoCodigoSAP: string;
  empleadoNombre: string;
  clienteCodigoSAP: string;
  clienteNombre: string;
  pedidoSAP: string | null;
  facturaSAP: string | null;
  latitud: number | null;
  longitud: number | null;
}

@Injectable()
export class EntregasService {
  constructor(
    @Inject(SqlServerService) private sql: SqlServerService,
  ) {}

  async getEntregasPorFecha(login: string, fecha: string): Promise<Entrega[]> {
    const rows = await this.sql.query(`
      SELECT
        t0.Id,
        t0.Fecha,
        t0.Estado,
        t2.CodigoERP  AS EmpleadoCodigoSAP,
        t2.Nombre     AS EmpleadoNombre,
        t3.CodigoERP  AS ClienteCodigoSAP,
        t3.Nombre     AS ClienteNombre,
        t3.Latitud    AS Latitud,
        t3.Longitud   AS Longitud,
        t4.CodigoERP  AS PedidoSAP,
        t5.CodigoERP  AS FacturaSAP
      FROM [bd_dms_minoil_prod_icorebiz].[GEN].[Programacion] t0
      INNER JOIN [bd_dms_minoil_prod_icorebiz].[ERP].[Empleado]  t2 ON t0.IdEmpleado = t2.Id
      INNER JOIN [bd_dms_minoil_prod_icorebiz].[SIS].[Usuario]   t6 ON t0.IdEmpleado = t6.IdEmpleado
      INNER JOIN [bd_dms_minoil_prod_icorebiz].[ERP].[Cliente]   t3 ON t3.Id = t0.IdCliente
      LEFT  JOIN [bd_dms_minoil_prod_icorebiz].[PEG].[Orden]     t4 ON t4.Id = t0.IdOperacion
      LEFT  JOIN [bd_dms_minoil_prod_icorebiz].[ENT].[Entrega]   t5 ON t5.IdOrden = t4.Id
      WHERE t0.IdTipoOperacion = 2
        AND t0.ViaProgramacion = 'A'
        AND CAST(t0.Fecha AS DATE) = @fecha
        AND t6.[Login] = @login
      ORDER BY t0.Estado DESC
    `, { fecha, login });

    return rows.map((r: any) => ({
      id:                r.Id,
      fecha:             r.Fecha ? new Date(r.Fecha).toISOString().split('T')[0] : '',
      estado:            r.Estado,
      empleadoCodigoSAP: String(r.EmpleadoCodigoSAP ?? ''),
      empleadoNombre:    String(r.EmpleadoNombre ?? ''),
      clienteCodigoSAP:  String(r.ClienteCodigoSAP ?? ''),
      clienteNombre:     String(r.ClienteNombre ?? ''),
      pedidoSAP:         r.PedidoSAP  ? String(r.PedidoSAP)  : null,
      facturaSAP:        r.FacturaSAP ? String(r.FacturaSAP) : null,
      latitud:           r.Latitud  != null ? Number(r.Latitud)  : null,
      longitud:          r.Longitud != null ? Number(r.Longitud) : null,
    }));
  }
}
