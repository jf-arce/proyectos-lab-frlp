import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '@/modules/users/users.service';
import { UserRole } from '@/modules/users/entities/user.entity';
import { AlumnoService } from '@/modules/alumno/alumno.service';
import { ResponsableLaboratorioService } from '@/modules/responsable-laboratorio/responsable-laboratorio.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly alumnoService: AlumnoService,
    private readonly responsableService: ResponsableLaboratorioService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const emailTaken = await this.usersService.emailExists(dto.email);
    if (emailTaken) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await hash(dto.password, BCRYPT_SALT_ROUNDS);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.create(
        dto.email,
        hashedPassword,
        dto.rol,
        queryRunner.manager,
      );

      let laboratorioId: string | undefined;

      if (dto.rol === UserRole.ALUMNO) {
        await this.alumnoService.create(
          user.id,
          {
            nombre: dto.nombre!,
            apellido: dto.apellido!,
            legajo: dto.legajo!,
            anioEnCurso: dto.anioEnCurso!,
          },
          queryRunner.manager,
        );
      } else {
        const laboratorioExists = await queryRunner.manager
          .getRepository('laboratorio')
          .findOne({ where: { id: dto.laboratorioId } });

        if (!laboratorioExists) {
          throw new NotFoundException(
            `Laboratorio con id ${dto.laboratorioId!} no encontrado`,
          );
        }

        await this.responsableService.create(
          user.id,
          {
            nombre: dto.nombre!,
            apellido: dto.apellido!,
            laboratorioId: dto.laboratorioId!,
          },
          queryRunner.manager,
        );
        laboratorioId = dto.laboratorioId;
      }

      await queryRunner.commitTransaction();

      const accessToken = this.signAccessToken(
        user.id,
        user.email,
        user.rol,
        laboratorioId,
      );
      return { accessToken };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const laboratorioId = await this.getLaboratorioId(user.id, user.rol);
    const accessToken = this.signAccessToken(
      user.id,
      user.email,
      user.rol,
      laboratorioId,
    );
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  async refresh(refreshTokenPlain: string): Promise<{ accessToken: string }> {
    const now = new Date();
    const candidates = await this.refreshTokenRepository.find({
      relations: ['user'],
    });

    for (const candidate of candidates) {
      if (candidate.expiresAt > now) {
        const isMatch = await compare(refreshTokenPlain, candidate.tokenHash);
        if (isMatch) {
          const laboratorioId = await this.getLaboratorioId(
            candidate.user.id,
            candidate.user.rol,
          );
          const accessToken = this.signAccessToken(
            candidate.user.id,
            candidate.user.email,
            candidate.user.rol,
            laboratorioId,
          );
          return { accessToken };
        }
      }
    }

    throw new UnauthorizedException('Refresh token inválido o expirado');
  }

  async logout(refreshTokenPlain: string): Promise<{ message: string }> {
    const now = new Date();
    const candidates = await this.refreshTokenRepository.find();

    for (const candidate of candidates) {
      if (candidate.expiresAt > now) {
        const isMatch = await compare(refreshTokenPlain, candidate.tokenHash);
        if (isMatch) {
          await this.refreshTokenRepository.delete(candidate.id);
          return { message: 'Sesión cerrada correctamente' };
        }
      }
    }

    throw new UnauthorizedException('Refresh token inválido');
  }

  private async getLaboratorioId(
    usuarioId: string,
    rol: UserRole,
  ): Promise<string | undefined> {
    if (rol !== UserRole.RESPONSABLE_LABORATORIO) return undefined;
    const responsable =
      await this.responsableService.findByUsuarioId(usuarioId);
    return responsable?.laboratorio.id;
  }

  private signAccessToken(
    userId: string,
    email: string,
    role: UserRole,
    laboratorioId?: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      role,
      ...(laboratorioId && { laboratorioId }),
    };
    return this.jwtService.sign(payload);
  }

  private async generateAndStoreRefreshToken(userId: string): Promise<string> {
    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = await hash(plainToken, BCRYPT_SALT_ROUNDS);

    const expirationDays = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION_DAYS',
      7,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    const refreshToken = this.refreshTokenRepository.create({
      user: { id: userId },
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);

    return plainToken;
  }
}
