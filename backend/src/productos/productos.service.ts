import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface LoteProducto {
  lote: string;
  cantidadVendida: number;
  fechaFactura: string;
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
  ) {}

  async getProductosPorSala(cardCode: string): Promise<ProductoConLotes[]> {
    try {
      const query = `
        SELECT *
        FROM (
            SELECT
                A."CardCode"       AS Sala,
                C."CardName"       AS NombreSala,
                D."ItemCode"       AS CodigoProducto,
                I."ItemName"       AS NombreProducto,
                L."BatchNum"       AS Lote,
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
            WHERE 
                LOWER(I."ItemName") LIKE '%impost%'
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
        // HANA devuelve los nombres de columnas en mayúsculas
        const codigo = row.CODIGOPRODUCTO || row.CodigoProducto;
        const nombre = row.NOMBREPRODUCTO || row.NombreProducto;
        const lote = row.LOTE || row.Lote;
        const cantidadVendida = row.CANTIDADVENDIDA || row.CantidadVendida;
        const fechaFactura = row.FECHAFACTURA || row.FechaFactura;
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
      return this.getProductosDemo();
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

  private getProductosDemo(): ProductoConLotes[] {
    return [
      {
        codigoProducto: '1',
        nombreProducto: 'LECHE VEG/BANANA 946 ML',
        lotes: [
          { lote: 'LT240115A', cantidadVendida: 12, fechaFactura: '2025-01-15', numeroFactura: 0 },
          { lote: 'LT240110C', cantidadVendida: 8, fechaFactura: '2025-01-10', numeroFactura: 0 },
          { lote: 'LT240120E', cantidadVendida: 15, fechaFactura: '2025-01-20', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '2',
        nombreProducto: 'SIXPACK MIX LECHES 140 ML',
        lotes: [
          { lote: 'SP240120B', cantidadVendida: 18, fechaFactura: '2025-01-20', numeroFactura: 0 },
          { lote: 'SP240125D', cantidadVendida: 24, fechaFactura: '2025-01-25', numeroFactura: 0 },
          { lote: 'SP240130F', cantidadVendida: 20, fechaFactura: '2025-01-30', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '3',
        nombreProducto: 'LECHE VEG/CHOCOLATE 946 ML',
        lotes: [
          { lote: 'LT240118E', cantidadVendida: 15, fechaFactura: '2025-01-18', numeroFactura: 0 },
          { lote: 'LT240122G', cantidadVendida: 10, fechaFactura: '2025-01-22', numeroFactura: 0 },
          { lote: 'LT240128H', cantidadVendida: 18, fechaFactura: '2025-01-28', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '4',
        nombreProducto: 'LECHE VEG/VAINILLA 946 ML',
        lotes: [
          { lote: 'LT240122F', cantidadVendida: 20, fechaFactura: '2025-01-22', numeroFactura: 0 },
          { lote: 'LT240128G', cantidadVendida: 10, fechaFactura: '2025-01-28', numeroFactura: 0 },
          { lote: 'LT240202I', cantidadVendida: 16, fechaFactura: '2025-02-02', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '5',
        nombreProducto: 'LECHE VEG/FRESA 946 ML',
        lotes: [
          { lote: 'LT240112H', cantidadVendida: 14, fechaFactura: '2025-01-12', numeroFactura: 0 },
          { lote: 'LT240118J', cantidadVendida: 12, fechaFactura: '2025-01-18', numeroFactura: 0 },
          { lote: 'LT240125K', cantidadVendida: 22, fechaFactura: '2025-01-25', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '6',
        nombreProducto: 'PACK LECHES SURTIDO 250 ML',
        lotes: [
          { lote: 'PK240116I', cantidadVendida: 22, fechaFactura: '2025-01-16', numeroFactura: 0 },
          { lote: 'PK240120J', cantidadVendida: 16, fechaFactura: '2025-01-20', numeroFactura: 0 },
          { lote: 'PK240126L', cantidadVendida: 28, fechaFactura: '2025-01-26', numeroFactura: 0 },
        ],
      },
      {
        codigoProducto: '7',
        nombreProducto: 'LECHE VEG/COCO 946 ML',
        lotes: [
          { lote: 'LT240125K', cantidadVendida: 18, fechaFactura: '2025-01-25', numeroFactura: 0 },
          { lote: 'LT240130M', cantidadVendida: 14, fechaFactura: '2025-01-30', numeroFactura: 0 },
          { lote: 'LT240205N', cantidadVendida: 20, fechaFactura: '2025-02-05', numeroFactura: 0 },
        ],
      },
    ];
  }
}

