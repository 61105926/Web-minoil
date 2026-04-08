import { Injectable, HttpException, HttpStatus, Inject, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { SqlServerService } from '../sqlserver/sqlserver.service';
import { MobileLoginDto } from './dto/mobile-login.dto';

@Injectable()
export class MobileAuthService {
  constructor(@Inject(SqlServerService) private readonly sqlServer: SqlServerService) {}

  async login(dto: MobileLoginDto) {
    const hashedPassword = createHash('sha256')
      .update(dto.password)
      .digest('base64')

    try {
      const rows = await this.sqlServer.query(
        `EXEC [SIS].[sp_usuario_obtener]
           @Login    = @Login,
           @Password = @Password,
           @Imei     = @Imei,
           @Version  = @Version`,
        {
          Login:    dto.login,
          Password: hashedPassword,
          Imei:     dto.imei,
          Version:  dto.version ?? null,
        },
      );

      if (!rows || rows.length === 0) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const usuario = rows[0];

      return {
        success: true,
        usuario: {
          id:          usuario.Id         ?? usuario.ID,
          login:       usuario.Login      ?? usuario.LOGIN,
          idEmpleado:  usuario.IdEmpleado ?? usuario.IDEMPLEADO,
          nombre:      usuario.Nombre     ?? usuario.NOMBRE,
          estado:      usuario.Estado     ?? usuario.ESTADO,
          imei:        usuario.Imei       ?? usuario.IMEI,
          perfil:      usuario.IdPerfil   ?? usuario.IDPERFIL,
        },
      };
    } catch (err: any) {
      console.error('[MobileAuth] error SP:', err.message)
      // RAISERROR del SP — el mensaje viene como error de mssql
      if (err.message?.includes('Invalido') || err.message?.includes('Inactivo') ||
          err.message?.includes('Deshabilitado') || err.message?.includes('No existe')) {
        throw new HttpException(
          { success: false, message: err.message.split('/').pop()?.trim() ?? err.message },
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        { success: false, message: err.message ?? 'Error interno' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
