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

export const sendPasswordResetEmail = async (to, resetURL) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.to = [to];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: 'Hospital de Maracaí',
  };
  sendSmtpEmail.subject = 'Redefinição de Senha - Hospital de Maracaí';
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h1>Redefinição de Senha</h1>
        <p>Olá, ${to.name},</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se não foi você, por favor, ignore este e-mail.</p>
        <p style="margin: 20px 0;">
          <a 
            href="${resetURL}" 
            target="_blank" 
            style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;"
          >
            Redefinir Senha
          </a>
        </p>
        <p>Atenciosamente,<br>Equipe do Hospital de Maracaí</p>
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
