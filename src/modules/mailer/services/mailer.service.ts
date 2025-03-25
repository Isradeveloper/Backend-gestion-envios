import { Resend } from 'resend';
import { envs } from '../../../config';
import { SendMail } from './interfaces/send-mail.interface';

export class ResendService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(envs.RESEND_API_KEY);
  }

  async sendMail({
    to,
    subject,
    htmlContent,
    textContent,
    attachments,
  }: SendMail) {
    const { data, error } = await this.resend.emails.send({
      from: 'info@reserva-casino.condevs.com.co',
      to,
      subject,
      html: htmlContent || '',
      text: textContent || '',
      attachments: attachments || [],
    });

    if (error) {
      console.log(error);
      return false;
    }

    return true;
  }
}
