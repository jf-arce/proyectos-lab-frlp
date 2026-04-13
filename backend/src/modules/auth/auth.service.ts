import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { UsersService } from '@/modules/users/users.service';
import { UserRole } from '@/modules/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    if (dto.rol === UserRole.RESPONSABLE_LABORATORIO && !dto.laboratoryId) {
      throw new BadRequestException(
        'laboratoryId es requerido para RESPONSABLE_LABORATORIO',
      );
    }

    const emailTaken = await this.usersService.emailExists(dto.email);
    if (emailTaken) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.usersService.create(
      dto.email,
      hashedPassword,
      dto.rol,
      dto.laboratoryId,
    );

    const accessToken = this.signAccessToken(
      user.id,
      user.email,
      user.rol,
      user.laboratorioId ?? undefined,
    );

    return { accessToken };
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

    const accessToken = this.signAccessToken(
      user.id,
      user.email,
      user.rol,
      user.laboratorioId ?? undefined,
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
          const accessToken = this.signAccessToken(
            candidate.user.id,
            candidate.user.email,
            candidate.user.rol,
            candidate.user.laboratorioId ?? undefined,
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
