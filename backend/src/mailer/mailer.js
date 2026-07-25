import { Resend } from 'resend';

/**
 * @file Servicio de envío de correos electrónicos vía Resend.
 * @description Envío genérico y plantilla de recuperación de contraseña.
 */

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * @class Mailer
 * @description Cliente de correo que usa la API de Resend (omite el envío si falta la API key).
 */
export default class Mailer {
  /**
   * @description Inicializa el cliente Resend y el remitente por defecto.
   */
  constructor() {
    this.resend = resend;
    this.defaultFrom = process.env.EMAIL || 'onboarding@resend.dev';
  }

  /**
   * @description Envía un correo HTML. Si no hay `RESEND_API_KEY`, omite el envío.
   * @param {string|string[]} to - Destinatario(s).
   * @param {string} subject - Asunto del correo.
   * @param {string} html - Cuerpo HTML.
   * @returns {Promise<Object>} Resultado de Resend, o `{ skipped, reason }` si no hay API key.
   * @throws {Error} Si la API de Resend falla al enviar.
   */
  async sendEmail(to, subject, html) {
    if (!this.resend) {
      console.warn('RESEND_API_KEY is not set. Skipping email send.');
      return { skipped: true, reason: 'missing_api_key' };
    }

    try {
      const result = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject,
        html,
      });
      if (result?.error) console.error('[mailer] resend error:', result.error);
      return result;
    } catch (error) {
      console.error('[mailer] sendEmail failed:', {
        to,
        subject,
        error: error?.message || error,
      });
      throw error;
    }
  }

  /**
   * @description Envía el correo de recuperación de contraseña con enlace y token.
   * @param {Object} options - Datos del correo de recuperación.
   * @param {string} options.email - Destinatario.
   * @param {string} options.token - Token JWT de restablecimiento.
   * @param {string} options.origin - Origen del frontend para construir la URL.
   * @param {string} [options.username] - Nombre de usuario para el saludo.
   * @returns {Promise<Object>} Resultado del envío.
   * @throws {Error} Si falla el envío.
   */
  async sendRecoveryEmail({ email, token, origin, username }) {
    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;

    return this.sendEmail(
      email,
      'Spectra Suite - Password Recovery',
      `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.4;">
            <h2>Recuperación de contraseña</h2>

            <p>Hola${username ? ` <b>${username}</b>` : ''},</p>

            <p>Recibimos una solicitud para restablecer tu contraseña.</p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 10px 14px;
                  background: #3d1b39;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                Restablecer contraseña
              </a>
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 8px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
              <br />
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>

            <p style="color: #666; font-size: 12px;">
              Si no fuiste tú, ignora este correo.
            </p>
          </body>
        </html>
      `,
    );
  }
}
