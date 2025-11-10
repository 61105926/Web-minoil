import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ImpostorStockData {
  CardCode: string;
  ItemCode: string;
  BatchNum: string;
  StockSala: number;
  StockBodega: number;
}

@Injectable()
export class ImpostorService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
  ) {}

  async insertarStockProductoLote(datos: ImpostorStockData[]): Promise<void> {
    if (!datos || datos.length === 0) {
      throw new Error('No hay datos para insertar');
    }

    try {
      console.log(`🔵 Insertando ${datos.length} registros en ImpostorStockProductoLote`);

      // Insertar cada registro individualmente
      for (const registro of datos) {
        const query = `
          INSERT INTO "MINOILDES"."ImpostorStockProductoLote" 
          ("CardCode", "ItemCode", "BatchNum", "StockSala", "StockBodega")
          VALUES (?, ?, ?, ?, ?)
        `;

        await this.databaseService.execute(query, [
          registro.CardCode,
          registro.ItemCode,
          registro.BatchNum,
          registro.StockSala,
          registro.StockBodega,
        ]);

        console.log(`✅ Insertado: ${registro.CardCode} - ${registro.ItemCode} - ${registro.BatchNum}`);
      }

      console.log(`✅ Todos los registros insertados correctamente`);
    } catch (error: any) {
      console.error('❌ Error insertando datos:', error);
      throw new Error(`Error al insertar datos: ${error.message}`);
    }
  }

  async verificarTabla(): Promise<{ nombreTabla: string; columnas: Record<string, string> }> {
    try {
      // Primero, intentar listar las tablas del schema para ver qué existe
      console.log('🔵 Verificando tablas en el schema MINOILDES...');
      try {
        const tablasQuery = `
          SELECT TABLE_NAME 
          FROM SYS.TABLES 
          WHERE SCHEMA_NAME = 'MINOILDES' 
          AND (TABLE_NAME LIKE '%IMPOSTOR%' OR TABLE_NAME LIKE '%Impostor%')
        `;
        const tablas = await this.databaseService.query(tablasQuery);
        console.log('📋 Tablas encontradas con "IMPOSTOR" en el nombre:', tablas);
      } catch (error: any) {
        console.log('⚠️  No se pudieron listar las tablas:', error.message);
      }

      // Intentar diferentes variaciones del nombre de la tabla
      const variaciones = [
        '"MINOILDES"."ImpostorStockProductoLote"',
        'MINOILDES.ImpostorStockProductoLote',
        '"MINOILDES"."IMPOSTORSTOCKPRODUCTOLOTE"',
        'MINOILDES.IMPOSTORSTOCKPRODUCTOLOTE',
        'MINOILDES."ImpostorStockProductoLote"',
        '"MINOILDES".ImpostorStockProductoLote',
      ];

      let nombreTablaEncontrado = '';

      for (const tabla of variaciones) {
        try {
          const query = `SELECT COUNT(*) as count FROM ${tabla} WHERE 1=0`;
          await this.databaseService.query(query);
          console.log(`✅ Tabla encontrada: ${tabla}`);
          nombreTablaEncontrado = tabla;
          break;
        } catch (error: any) {
          console.log(`⚠️  Tabla no encontrada: ${tabla} - ${error.message.substring(0, 100)}`);
        }
      }

      if (!nombreTablaEncontrado) {
        throw new Error('No se pudo encontrar la tabla ImpostorStockProductoLote en el schema MINOILDES. Por favor, verifica que la tabla existe y que el nombre es correcto.');
      }

      // Obtener los nombres reales de las columnas
      console.log('🔵 Obteniendo nombres de columnas de la tabla...');
      const columnasQuery = `
        SELECT COLUMN_NAME 
        FROM SYS.TABLE_COLUMNS 
        WHERE SCHEMA_NAME = 'MINOILDES' 
        AND TABLE_NAME = 'ImpostorStockProductoLote'
        ORDER BY POSITION
      `;
      
      let columnas: any[] = [];
      try {
        columnas = await this.databaseService.query(columnasQuery);
        console.log('📋 Columnas encontradas:', columnas);
      } catch (error: any) {
        console.log('⚠️  No se pudieron obtener las columnas:', error.message);
      }

      // Mapear los nombres de columnas esperados a los reales
      const mapeoColumnas: Record<string, string> = {};
      const columnasEsperadas = ['CardCode', 'ItemCode', 'BatchNum', 'StockSala', 'StockBodega'];
      
      if (columnas.length > 0) {
        const nombresColumnas = columnas.map((c: any) => c.COLUMN_NAME || c.column_name);
        console.log('📋 Nombres de columnas en la tabla:', nombresColumnas);
        
        // Intentar mapear cada columna esperada
        for (const colEsperada of columnasEsperadas) {
          const colEncontrada = nombresColumnas.find((c: string) => 
            c === colEsperada || 
            c === colEsperada.toUpperCase() || 
            c === colEsperada.toLowerCase() ||
            c === `"${colEsperada}"` ||
            c === `"${colEsperada.toUpperCase()}"` ||
            c === `"${colEsperada.toLowerCase()}"`
          );
          
          if (colEncontrada) {
            mapeoColumnas[colEsperada] = colEncontrada;
          } else {
            // Si no se encuentra, usar el nombre esperado
            mapeoColumnas[colEsperada] = colEsperada;
          }
        }
      } else {
        // Si no se pueden obtener las columnas, usar los nombres esperados
        columnasEsperadas.forEach(col => {
          mapeoColumnas[col] = col;
        });
      }

      console.log('📋 Mapeo de columnas:', mapeoColumnas);

      return { nombreTabla: nombreTablaEncontrado, columnas: mapeoColumnas };
    } catch (error: any) {
      console.error('❌ Error verificando tabla:', error);
      throw error;
    }
  }

  async insertarStockProductoLoteBatch(datos: ImpostorStockData[]): Promise<void> {
    if (!datos || datos.length === 0) {
      throw new Error('No hay datos para insertar');
    }

    try {
      console.log(`🔵 Insertando ${datos.length} registros en lote en ImpostorStockProductoLote`);

      // Verificar qué nombre de tabla funciona y obtener los nombres de columnas
      const { nombreTabla, columnas } = await this.verificarTabla();

      // Validar que todos los datos tengan los campos requeridos
      datos.forEach((registro, index) => {
        if (!registro.CardCode || !registro.ItemCode || !registro.BatchNum) {
          throw new Error(`Registro ${index + 1} incompleto: CardCode=${registro.CardCode}, ItemCode=${registro.ItemCode}, BatchNum=${registro.BatchNum}`);
        }
      });

      // Usar los nombres de columnas correctos
      const CardCodeCol = columnas['CardCode'] || 'CardCode';
      const ItemCodeCol = columnas['ItemCode'] || 'ItemCode';
      const BatchNumCol = columnas['BatchNum'] || 'BatchNum';
      const StockSalaCol = columnas['StockSala'] || 'StockSala';
      const StockBodegaCol = columnas['StockBodega'] || 'StockBodega';

      // Insertar cada registro individualmente para mejor manejo de errores
      for (let i = 0; i < datos.length; i++) {
        const registro = datos[i];
        const query = `
          INSERT INTO ${nombreTabla} 
          (${CardCodeCol}, ${ItemCodeCol}, ${BatchNumCol}, ${StockSalaCol}, ${StockBodegaCol})
          VALUES (?, ?, ?, ?, ?)
        `;

        const params = [
          registro.CardCode,
          registro.ItemCode,
          registro.BatchNum,
          registro.StockSala || 0,
          registro.StockBodega || 0,
        ];

        console.log(`🔵 Insertando registro ${i + 1}/${datos.length}: ${registro.CardCode} - ${registro.ItemCode} - ${registro.BatchNum}`);

        try {
          await this.databaseService.execute(query, params);
          console.log(`✅ Registro ${i + 1} insertado correctamente`);
        } catch (error: any) {
          console.error(`❌ Error insertando registro ${i + 1}:`, error.message);
          console.error(`❌ Query:`, query);
          console.error(`❌ Registro:`, JSON.stringify(registro, null, 2));
          throw new Error(`Error al insertar registro ${i + 1}: ${error.message}`);
        }
      }

      console.log(`✅ Todos los ${datos.length} registros insertados correctamente`);
    } catch (error: any) {
      console.error('❌ Error insertando datos en lote:', error);
      console.error('❌ Stack:', error.stack);
      throw error;
    }
  }
}

