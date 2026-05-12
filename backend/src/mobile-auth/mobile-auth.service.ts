import { Injectable, HttpException, HttpStatus, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { SqlServerService } from '../sqlserver/sqlserver.service';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const baseUrl   = (process.env.KEYCLOAK_SERVER_URL ?? '').replace(/\/$/, '');
    const realm     = process.env.KEYCLOAK_REALM;
    const clientId  = process.env.KEYCLOAK_CLIENT_ID;
    const adminUser = process.env.KEYCLOAK_ADMIN_USER;
    const adminPass = process.env.KEYCLOAK_ADMIN_PASSWORD;

    // 1. Verificar contraseña actual intentando login ROPC
    const verifyRes = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id:  clientId,
        username:   dto.username,
        password:   dto.currentPassword,
      }).toString(),
    });

    if (!verifyRes.ok) {
      const verifyData: any = await verifyRes.json().catch(() => ({}));
      const desc: string = verifyData.error_description ?? '';
      // Si NO es "not fully set up", la contraseña actual es incorrecta
      if (!desc.includes('not fully set up') && !desc.includes('Account is not fully set up')) {
        throw new HttpException('La contraseña actual es incorrecta', HttpStatus.BAD_REQUEST);
      }
    }

    // 2. Obtener token de administrador desde el realm master
    const adminTokenRes = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id:  'admin-cli',
        username:   adminUser,
        password:   adminPass,
      }).toString(),
    });

    if (!adminTokenRes.ok) {
      console.error('[changePassword] No se pudo obtener token admin:', await adminTokenRes.text());
      throw new HttpException('Error interno de autenticación', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { access_token: adminToken } = await adminTokenRes.json() as any;

    // 3. Buscar usuario por username exacto
    const usersRes = await fetch(
      `${baseUrl}/admin/realms/${realm}/users?username=${encodeURIComponent(dto.username)}&exact=true`,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );

    if (!usersRes.ok) {
      throw new HttpException('Error buscando usuario en Keycloak', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const users: any[] = await usersRes.json();
    if (!users.length) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    const userId = users[0].id as string;

    // 4. Cambiar contraseña (temporal = false para que no vuelva a pedir cambio)
    const resetRes = await fetch(`${baseUrl}/admin/realms/${realm}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: {
        Authorization:  `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'password', value: dto.newPassword, temporary: false }),
    });

    if (!resetRes.ok) {
      console.error('[changePassword] Error reset-password:', await resetRes.text());
      throw new HttpException('Error al cambiar la contraseña en Keycloak', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
