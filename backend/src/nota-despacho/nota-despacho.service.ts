import {
  BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface NotaDespachoCabecera {
  DocEntry: number;
  DocNum: number;
  CardCode: string;
  NroFactura: string | number;
  Fecha: string;
  Vencimiento: string;
  Cliente: string;
  Direccion: string;
  RazonSocial: string;
  U_NIT: string;
  Pedido: string;
  DocTotalFC: string | number;
  TransId: number;
  SaldoVencido: string | number;
  SlpCode: number;
  SlpName: string;
  DiscSumFC: string | number;
  Almacen: string | null;
}

export interface NotaDespachoLinea {
  Orden: string;
  ItemCode: string;
  Dscription: string;
  UnidadMedida: string;
  Quantity: string | number;
  Precio: string | number;
  SubTotal: string | number;
  VisOrder: number;
  CodeBars: string | null;
  ICE: string | number;
}

const S = '"BD_MINOIL_PROD".';

const SQL_CABECERA = `
SELECT DISTINCT
  T0."DocEntry", T0."DocNum", T0."CardCode",
  IFNULL(T0."U_NRO_FAC", '0') "NroFactura",
  T0."TaxDate" "Fecha", T0."DocDueDate" "Vencimiento", T0."CardName" "Cliente",
  IFNULL(T3."Street", '') || ' ' || IFNULL(T3."Address3", '') "Direccion",
  T0."U_RAZSOC" "RazonSocial", T0."U_NIT",
  IFNULL((SELECT DISTINCT CAST(SQ1."DocNum" AS VARCHAR(20))
          FROM ${S}ORDR SQ1 INNER JOIN ${S}INV1 SQ2 ON SQ1."DocEntry" = SQ2."BaseEntry" AND SQ2."DocEntry" = T0."DocEntry"), '*') "Pedido",
  T0."DocTotalFC", T0."TransId",
  (T0."DocTotalFC" - (
    SELECT IFNULL(SUM(PT1."AppliedFC"), 0)
    FROM ${S}RCT2 PT1 INNER JOIN ${S}ORCT PT0 ON PT0."DocNum" = PT1."DocNum"
    WHERE PT0."Canceled" = 'N' AND PT1."DocEntry" = T0."DocEntry")) "SaldoVencido",
  T1."SlpCode", T1."SlpName", T0."DiscSumFC",
  (SELECT MAX(W."WhsName") FROM ${S}INV1 L INNER JOIN ${S}OWHS W ON W."WhsCode" = L."WhsCode"
   WHERE L."DocEntry" = T0."DocEntry") "Almacen"
FROM ${S}OINV T0
  INNER JOIN ${S}OSLP T1 ON T0."SlpCode" = T1."SlpCode"
  LEFT JOIN ${S}CRD1 T3 ON T3."CardCode" = T0."CardCode" AND T3."LineNum" = 0
WHERE T0."U_CLAVE_ACCESO" = ?`;

const SQL_DETALLE = `
SELECT
  '1. Pedido' "Orden", T1."ItemCode",
  CASE WHEN T5."FrgnName" != '' THEN T5."FrgnName" ELSE T5."ItemName" END "Dscription",
  T1."unitMsr" "UnidadMedida", T1."Quantity" "Quantity", T1."PriceAfVAT" "Precio",
  T1."PriceAfVAT" * T1."Quantity" "SubTotal", T1."VisOrder", T5."CodeBars",
  (IFNULL(T14."TotalFrgn", 0) + IFNULL(T15."TotalFrgn", 0)) "ICE"
FROM ${S}INV1 T1
  INNER JOIN ${S}OINV T0 ON T0."DocEntry" = T1."DocEntry"
  INNER JOIN ${S}OITM T5 ON T5."ItemCode" = T1."ItemCode"
  LEFT JOIN ${S}INV2 T14 ON T0."DocEntry" = T14."DocEntry" AND T14."ExpnsCode" = '1' AND T1."LineNum" = T14."LineNum"
  LEFT JOIN ${S}INV2 T15 ON T0."DocEntry" = T15."DocEntry" AND T15."ExpnsCode" = '2' AND T1."LineNum" = T15."LineNum"
WHERE T0."U_CLAVE_ACCESO" = ?
UNION ALL
SELECT DISTINCT
  '3.Bonificacion Proveedor' || '-' || T6."NumAtCard" "Orden", T5."ItemCode",
  CASE WHEN T7."FrgnName" != '' THEN T7."FrgnName" ELSE T7."ItemName" END "Dscription",
  T5."unitMsr" "UnidadMedida", T5."Quantity" "Quantity", 0 "Precio", 0 "SubTotal",
  T5."VisOrder", T7."CodeBars", 0 "ICE"
FROM ${S}OINV T0
  INNER JOIN ${S}INV1 T1 ON T0."DocEntry" = T1."DocEntry"
  INNER JOIN ${S}ORDR T3 ON T3."DocNum" = T1."BaseRef"
  INNER JOIN ${S}ORDR T4 ON T4."PickRmrk" = T3."DocNum"
  INNER JOIN ${S}INV1 T5 ON IFNULL(T5."BaseRef", '') = CAST(T4."DocNum" AS VARCHAR(10))
  INNER JOIN ${S}OINV T6 ON T6."DocEntry" = T5."DocEntry"
  INNER JOIN ${S}OITM T7 ON T7."ItemCode" = T5."ItemCode"
WHERE T6."U_ESTADOFC" = 'V' AND T0."U_CLAVE_ACCESO" = ?`;

/** El CUF del SIAT es hexadecimal (≈ 50–60 caracteres). */
export function validarCuf(cuf: unknown): string {
  const value = String(cuf ?? '').trim().toUpperCase();
  if (!/^[0-9A-F]{20,100}$/.test(value)) {
    throw new BadRequestException('Debes indicar un CUF válido.');
  }
  return value;
}

@Injectable()
export class NotaDespachoService {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private async query<T>(sql: string, params: string[], label: string): Promise<T[]> {
    try {
      const rows = await this.db.query(sql, params, true);
      return Array.isArray(rows) ? rows : [];
    } catch (error: any) {
      console.error(`[NOTA-DESPACHO] Falló ${label}; código HANA: ${error.code ?? 'no disponible'}`);
      throw new ServiceUnavailableException('No se pudo consultar la nota de despacho. Inténtalo nuevamente.');
    }
  }

  async obtener(cufInput: unknown): Promise<{ cabecera: NotaDespachoCabecera; lineas: NotaDespachoLinea[] }> {
    const cuf = validarCuf(cufInput);
    const [cabecera] = await this.query<NotaDespachoCabecera>(SQL_CABECERA, [cuf], 'cabecera');
    if (!cabecera) throw new NotFoundException('No se encontró una factura con ese CUF.');

    const lineas = await this.query<NotaDespachoLinea>(SQL_DETALLE, [cuf, cuf], 'detalle');
    // Primero el pedido y luego las bonificaciones, cada grupo en el orden de la factura.
    lineas.sort((a, b) => a.Orden.localeCompare(b.Orden) || Number(a.VisOrder) - Number(b.VisOrder));
    return { cabecera, lineas };
  }
}
