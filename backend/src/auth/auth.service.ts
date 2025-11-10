import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DatabaseService) private databaseService: DatabaseService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const { username, password } = loginDto;

      // Usuarios estáticos por región
      const usuariosEstaticos = [
        { id: 1, username: 'scz@minoil.com.bo', email: 'scz@minoil.com.bo', region: 'Santa Cruz', password: '123' },
        { id: 2, username: 'lpz@minoil.com.bo', email: 'lpz@minoil.com.bo', region: 'La Paz', password: '123' },
        { id: 3, username: 'cbb@minoil.com.bo', email: 'cbb@minoil.com.bo', region: 'Cochabamba', password: '123' },
        { id: 99, username: 'admin', email: 'admin@minoil.com.bo', region: 'Administrador', password: 'admin123' },
      ];

      // Buscar usuario en la lista estática
      const usuarioEstatico = usuariosEstaticos.find(u => u.username === username || u.email === username);
      
      if (usuarioEstatico && usuarioEstatico.password === password) {
        const payload = { username: usuarioEstatico.username, sub: usuarioEstatico.id };
        try {
          const token = this.jwtService.sign(payload);
          return {
            access_token: token,
            user: {
              id: usuarioEstatico.id,
              username: usuarioEstatico.username,
              email: usuarioEstatico.email,
              region: usuarioEstatico.region,
            },
          };
        } catch (jwtError) {
          console.error('Error generando JWT:', jwtError);
          throw new Error(`Error generando token: ${jwtError.message}`);
        }
      }

      // Si no está en usuarios estáticos, intentar buscar en la base de datos
      const query = `SELECT "ID", "USERNAME", "PASSWORD_HASH" FROM "USUARIOS" WHERE "USERNAME" = ? OR "EMAIL" = ?`;

      try {
        const users = await this.databaseService.query(query, [username, username]);

        if (users && users.length > 0) {
          const user = users[0];

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH);

          if (isPasswordValid) {
            const payload = { username: user.USERNAME, sub: user.ID };
            try {
              const token = this.jwtService.sign(payload);
              return {
                access_token: token,
                user: {
                  id: user.ID,
                  username: user.USERNAME,
                },
              };
            } catch (jwtError) {
              console.error('Error generando JWT:', jwtError);
              throw new Error(`Error generando token: ${jwtError.message}`);
            }
          }
        }
      } catch (error) {
        // Si hay error con la BD, continuar con el error de credenciales
        console.error('Error consultando BD:', error);
      }

      throw new UnauthorizedException('Credenciales inválidas');
    } catch (error) {
      console.error('Error en login:', error);
      console.error('Stack:', error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Re-lanzar el error original para que NestJS lo maneje
      throw error;
    }
  }

  async validateUser(userId: number) {
    // Usuarios estáticos por región
    const usuariosEstaticos = [
      { id: 1, username: 'scz@minoil.com.bo', email: 'scz@minoil.com.bo', region: 'Santa Cruz' },
      { id: 2, username: 'lpz@minoil.com.bo', email: 'lpz@minoil.com.bo', region: 'La Paz' },
      { id: 3, username: 'cbb@minoil.com.bo', email: 'cbb@minoil.com.bo', region: 'Cochabamba' },
      { id: 99, username: 'admin', email: 'admin@minoil.com.bo', region: 'Administrador' },
    ];

    // Buscar en usuarios estáticos primero
    const usuarioEstatico = usuariosEstaticos.find(u => u.id === userId);
    if (usuarioEstatico) {
      return { ID: usuarioEstatico.id, USERNAME: usuarioEstatico.username };
    }

    // Si no está en estáticos, buscar en la base de datos
    try {
      const query = `SELECT "ID", "USERNAME" FROM "USUARIOS" WHERE "ID" = ?`;
      const users = await this.databaseService.query(query, [userId]);
      return users && users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error validando usuario:', error);
      return null;
    }
  }
}
