import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PostulacionEstado } from '@/modules/postulaciones/enums/postulacion-estado.enum';

interface SendEstadoActualizadoParams {
  alumnoEmail: string;
  alumnoNombre: string;
  proyectoTitulo: string;
  nuevoEstado: PostulacionEstado;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress =
      this.configService.get<string>('RESEND_FROM') ??
      'Portal Lab FRLP <no-reply@resend.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY no configurada — el envío de emails está deshabilitado',
      );
    }
  }

  async sendEstadoActualizado(
    params: SendEstadoActualizadoParams,
  ): Promise<void> {
    if (!this.resend) return;

    const estadoTexto =
      params.nuevoEstado === PostulacionEstado.ACEPTADA
        ? 'aceptada ✅'
        : 'rechazada ❌';

    const subject = `Tu postulación al proyecto "${params.proyectoTitulo}" fue ${estadoTexto}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Actualización de tu postulación</h2>
        <p>Hola <strong>${params.alumnoNombre}</strong>,</p>
        <p>
          Tu postulación al proyecto <strong>${params.proyectoTitulo}</strong>
          fue <strong>${estadoTexto}</strong>.
        </p>
        <p>Ingresá a la plataforma para más detalles.</p>
        <hr />
        <small>Portal de Gestión de Proyectos — UTN FRLP</small>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: [params.alumnoEmail],
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${params.alumnoEmail}: ${(error as Error).message}`,
      );
      // Falla silenciosa: no lanza excepción para no interrumpir el flujo principal
    }
  }
}
