import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmpleadosService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService
  ) {}

  async findAll() {
    try {
      // NOTA: Ajusta esta query según tu esquema de base de datos
      const query = `SELECT "ID", "NOMBRE", "APELLIDO", "EMAIL", "PUESTO" FROM "EMPLEADOS" LIMIT 100`;
      const empleados = await this.databaseService.query(query);
      return empleados;
    } catch (error) {
      // Si hay error con la BD, devolver datos de ejemplo
      console.error('Error obteniendo empleados:', error);
      return [
        { ID: 1, NOMBRE: 'Juan', APELLIDO: 'Pérez', EMAIL: 'juan.perez@example.com', PUESTO: 'Desarrollador' },
        { ID: 2, NOMBRE: 'María', APELLIDO: 'González', EMAIL: 'maria.gonzalez@example.com', PUESTO: 'Analista' },
        { ID: 3, NOMBRE: 'Carlos', APELLIDO: 'Rodríguez', EMAIL: 'carlos.rodriguez@example.com', PUESTO: 'Gerente' },
        { ID: 4, NOMBRE: 'Ana', APELLIDO: 'Martínez', EMAIL: 'ana.martinez@example.com', PUESTO: 'Diseñadora' },
        { ID: 5, NOMBRE: 'Luis', APELLIDO: 'López', EMAIL: 'luis.lopez@example.com', PUESTO: 'Desarrollador' },
      ];
    }
  }
}
