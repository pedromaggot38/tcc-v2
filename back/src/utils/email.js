import nodemailer from 'nodemailer';
/* 
export class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Hospital Maracaí - <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //  Sendgrid

      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {

  const html = PushManager.renderFile(
    `${__dirname}/../views/emails/${template}.pug`,{
      firstName: this.firstName,
      url: this.url,
      subject
    }
  )

  const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html,
    text: ,
    // html:
  };

    await this.newTransport().sendEmail(mailOptions)
  }

  async sendPasswordReset() {
    await this.send('passwordReset', '');
  }
}*/

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    //    service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'HM Dashboard <provedoria@ahbm.com.br>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.sendMail(mailOptions);
};
