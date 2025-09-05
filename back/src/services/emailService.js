import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import AppError from '../utils/appError.js';

const apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

export const sendPasswordResetEmail = async (to, token) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.to = [to];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: 'Hospital de Maracaí',
  };
  sendSmtpEmail.subject = 'Redefinição de Senha - Hospital de Maracaí';
  sendSmtpEmail.htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h1 style="color: #0056b3; text-align: center;">Redefinição de Senha</h1>
          <p>Olá, ${to.name},</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Use o código abaixo para continuar:</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Seu código de redefinição de senha:</p>
            <div style="display: inline-block; padding: 15px 25px; background-color: #f0f0f0; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin-top: 10px;">
              ${token}
            </div>
          </div>
          <p>Este código é válido por <strong>10 minutos</strong>. Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>
          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
            Atenciosamente,<br>Equipe do Hospital de Maracaí
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('E-mail de redefinição de senha enviado para:', to.email);
  } catch (error) {
    console.error('ERRO BRUTO DA BREVO:', JSON.stringify(error, null, 2));

    const errorMessage =
      error.response?.body?.message ||
      error.body?.message ||
      'Erro desconhecido ao enviar e-mail.';
    const errorCode = error.response?.body?.code || 'brevo_error';

    throw new AppError(
      `Falha no envio do e-mail: ${errorMessage} (código: ${errorCode})`,
      500,
    );
  }
};
