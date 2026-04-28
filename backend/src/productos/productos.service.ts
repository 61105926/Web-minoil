import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface LoteProducto {
  lote: string;
  cantidadVendida: number;
  fechaFactura: string;
  fechaVencimiento: string;
  numeroFactura: number;
}

export interface ProductoConLotes {
  codigoProducto: string;
  nombreProducto: string;
  lotes: LoteProducto[];
}

@Injectable()
export class ProductosService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) { }

  async getProductosMobile(): Promise<{ ItemCode: string; ItemName: string; CodeBars: string }[]> {
    const query = `
      SELECT "ItemCode", "ItemName", "CodeBars"
      FROM "BD_MINOIL_PROD"."OITM"
      WHERE "frozenFor" <> 'Y'
    `;
    const rows = await this.databaseService.query(query);
    return rows.map((r: any) => ({
      ItemCode: String(r.ItemCode ?? r.ITEMCODE ?? '').trim(),
      ItemName: String(r.ItemName ?? r.ITEMNAME ?? '').trim(),
      CodeBars: String(r.CodeBars ?? r.CODEBARS ?? '').trim(),
    }));
  }

  async recordStockSurvey(body: {
    cliente: string;
    producto: string;
    tipo: string;
    cantidad: number;
    bandeo: boolean;
    fecha_vencimiento: string;
    usrCreate: string;
  }): Promise<void> {
    const { cliente, producto, tipo, cantidad, bandeo, fecha_vencimiento, usrCreate } = body;

    const units = await this.getUnidadesMedida(producto);
    let baseQty = 1;
    for (const unit of units) {
      const uomName = unit.UomName ?? unit.UOMNAME ?? '';
      if (uomName === tipo) {
        baseQty = parseFloat(unit.BaseQty ?? unit.BASEQTY ?? 1);
        break;
      }
    }

    const invQty = baseQty * cantidad;
    const fv = fecha_vencimiento.substring(0, 10);
    const createDate = new Date().toISOString().substring(0, 10);

    const query = `
      INSERT INTO "MINOILDES"."TRADE_StockLotes_Tradicional"
        ("CardCode", "ItemCode", "Tipo", "Stock", "InvQty", "FV", "IdCenso", "UsrCreate", "CreateDate")
      VALUES
        (?, ?, ?, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, TO_DATE(?, 'YYYY-MM-DD'))
    `;

    await this.databaseService.execute(query, [
      cliente, producto, tipo, cantidad, invQty,
      fv, bandeo ? 1 : 0, usrCreate, createDate,
    ]);
  }

  async getUnidadesMedida(itemCode: string): Promise<any[]> {
    const query = `
      SELECT
        t1."UgpEntry",
        t3."UomCode",
        t3."UomName",
        t2."BaseQty"
      FROM "BD_MINOIL_PROD"."OITM" t0
      INNER JOIN "BD_MINOIL_PROD"."OUGP" t1 ON t0."UgpEntry" = t1."UgpEntry"
      INNER JOIN "BD_MINOIL_PROD"."UGP1" t2 ON t1."UgpEntry" = t2."UgpEntry"
      INNER JOIN "BD_MINOIL_PROD"."OUOM" t3 ON t2."UomEntry" = t3."UomEntry"
      WHERE t0."ItemCode" = ?
    `;
    return this.databaseService.query(query, [itemCode]);
  }

  async getCervezas(): Promise<{ codigoProducto: string; nombreProducto: string }[]> {
    try {
      const query = `
        SELECT
            T0."ItemCode",
            T0."ItemName",
            T0."CodeBars",
            T1."ItmsGrpNam" AS "Categoria"
        FROM "BD_MINOIL_PROD"."OITM" T0
        INNER JOIN "BD_MINOIL_PROD"."OITB" T1
            ON T0."ItmsGrpCod" = T1."ItmsGrpCod"
        WHERE T0."frozenFor" <> 'Y'
          AND T0."ItmsGrpCod" = 108
        ORDER BY T0."ItemName" ASC
      `;
      const resultados = await this.databaseService.query(query);

      return resultados.map((row: any) => {
        const codigo = row.ITEMCODE ?? row.ItemCode ?? (row as any).itemCode;
        const nombre = row.ITEMNAME ?? row.ItemName ?? (row as any).itemName;
        return {
          codigoProducto: codigo ? String(codigo).trim() : '',
          nombreProducto: nombre ? String(nombre).trim() : '',
        };
      }).filter(p => p.codigoProducto && p.nombreProducto);
    } catch (error: any) {
      console.error('Error obteniendo cervezas:', error);
      return [];
    }
  }

  async getProductosPorSala(cardCode: string, tipo: string = 'impost'): Promise<ProductoConLotes[]> {
    try {
      const filtroProducto = tipo === 'cerveza'
        ? 'I."ItmsGrpCod" = 108'
        : `LOWER(I."ItemName") LIKE '%impost%'`;

      const query = `
        SELECT *
        FROM (
            SELECT
                A."CardCode"       AS Sala,
                C."CardName"       AS NombreSala,
                D."ItemCode"       AS CodigoProducto,
                I."ItemName"       AS NombreProducto,
                L."BatchNum"       AS Lote,
                AL."ExpDate"       AS FechaVencimiento,
                L."Quantity"       AS CantidadVendida,
                A."DocDate"        AS FechaFactura,
                A."DocNum"         AS NumeroFactura,
                ROW_NUMBER() OVER (
                    PARTITION BY D."ItemCode"
                    ORDER BY A."DocDate" DESC, A."DocNum" DESC
                ) AS rn
            FROM "BD_MINOIL_PROD"."OINV" A
            INNER JOIN "BD_MINOIL_PROD"."INV1" D ON A."DocEntry" = D."DocEntry"
            INNER JOIN "BD_MINOIL_PROD"."OCRD" C ON A."CardCode" = C."CardCode"
            INNER JOIN "BD_MINOIL_PROD"."OITM" I ON D."ItemCode" = I."ItemCode"
            LEFT JOIN "BD_MINOIL_PROD"."IBT1" L
                ON L."BaseType" = 13
                AND L."BaseEntry" = D."DocEntry"
                AND L."BaseLinNum" = D."LineNum"
            INNER JOIN "BD_MINOIL_PROD"."OBTN" AL 
                ON AL."DistNumber" = L."BatchNum"
                AND AL."ItemCode" = L."ItemCode"
            WHERE 
                ${filtroProducto}
                AND A."CardCode" = ?
                AND I."frozenFor" <> 'Y'
                AND I."validFor" = 'Y'
        ) AS sub
        WHERE rn <= 3
        ORDER BY NombreProducto, FechaFactura DESC
      `;

      const resultados = await this.databaseService.query(query, [cardCode]);

      // Agrupar por producto
      const productosMap = new Map<string, ProductoConLotes>();

      resultados.forEach((row: any) => {
        // HANA/dev drivers pueden devolver columnas en distintos formatos; ItemCode es el código SAP
        const codigo =
          row.CODIGOPRODUCTO ??
          row.CodigoProducto ??
          row.ITEMCODE ??
          row.ItemCode ??
          (row as any).codigoproducto;
        const nombre =
          row.NOMBREPRODUCTO ??
          row.NombreProducto ??
          row.ITEMNAME ??
          row.ItemName ??
          (row as any).nombreproducto;
        const lote = row.LOTE || row.Lote;
        const cantidadVendida = row.CANTIDADVENDIDA || row.CantidadVendida;
        const fechaFactura = row.FECHAFACTURA || row.FechaFactura;
        const fechaVencimiento = row.FECHAVENCIMIENTO || row.FechaVencimiento;
        const numeroFactura = row.NUMEROFACTURA || row.NumeroFactura;

        if (!codigo || !nombre) {
          console.warn('Fila sin código o nombre de producto:', row);
          return;
        }

        const codigoStr = String(codigo).trim();
        const nombreStr = String(nombre).trim();

        if (!productosMap.has(codigoStr)) {
          productosMap.set(codigoStr, {
            codigoProducto: codigoStr,
            nombreProducto: nombreStr,
            lotes: [],
          });
        }

        const producto = productosMap.get(codigoStr)!;
        // Agregar lote solo si tiene datos válidos
        if (lote && String(lote).trim() !== '') {
          producto.lotes.push({
            lote: String(lote).trim(),
            cantidadVendida: cantidadVendida ? parseFloat(String(cantidadVendida)) : 0,
            fechaFactura: this.formatearFecha(fechaFactura),
            fechaVencimiento: this.formatearFecha(fechaVencimiento),
            numeroFactura: numeroFactura ? parseInt(String(numeroFactura)) : 0,
          });
        }
      });

      // Convertir map a array y asegurar que cada producto tenga exactamente 3 lotes
      const productos: ProductoConLotes[] = Array.from(productosMap.values())
        .filter((producto) => producto.lotes.length > 0) // Solo productos con al menos un lote
        .map((producto) => {
          // Ordenar lotes por fecha más reciente
          producto.lotes.sort((a, b) => {
            const fechaA = new Date(a.fechaFactura).getTime();
            const fechaB = new Date(b.fechaFactura).getTime();
            return fechaB - fechaA; // Más reciente primero
          });

          // Si tiene menos de 3 lotes, completar con lotes vacíos
          while (producto.lotes.length < 3) {
            producto.lotes.push({
              lote: '',
              cantidadVendida: 0,
              fechaFactura: '',
              fechaVencimiento: '',
              numeroFactura: 0,
            });
          }
          // Limitar a 3 lotes
          producto.lotes = producto.lotes.slice(0, 3);
          return producto;
        });

      console.log(`Productos encontrados para sala ${cardCode}:`, productos.length);
      productos.forEach(p => {
        console.log(`- ${p.nombreProducto}: ${p.lotes.filter(l => l.lote).length} lotes`);
      });

      return productos;
    } catch (error: any) {
      console.error('Error obteniendo productos:', error);
      // Si hay error, devolver productos de ejemplo
    }
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }


}

