import { Injectable, HttpException, HttpStatus, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { SqlServerService } from '../sqlserver/sqlserver.service';
import { MobileLoginDto } from './dto/mobile-login.dto';

@Injectable()
export class MobileAuthService {
  constructor(
    @Inject(SqlServerService) private readonly sqlServer: SqlServerService,
    @Inject(JwtService)       private readonly jwtService: JwtService,
  ) {}

  async login(dto: MobileLoginDto) {
    const hashedPassword = createHash('sha256').update(dto.password).digest('base64');

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

      const u = rows[0];
      const usuario = {
        id:         u.Id         ?? u.ID,
        login:      u.Login      ?? u.LOGIN,
        idEmpleado: u.IdEmpleado ?? u.IDEMPLEADO,
        nombre:     u.Nombre     ?? u.NOMBRE,
        estado:     u.Estado     ?? u.ESTADO,
        imei:       u.Imei       ?? u.IMEI,
        perfil:     u.IdPerfil   ?? u.IDPERFIL,
      };

      const token = this.jwtService.sign({
        sub:        usuario.id,
        login:      usuario.login,
        idEmpleado: usuario.idEmpleado,
      });

      return { success: true, access_token: token, usuario };
    } catch (err: any) {
      console.error('[MobileAuth] error SP:', err.message);
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
