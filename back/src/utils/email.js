import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
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

  transporter.sendMail(mailOptions);
};

export default sendEmail;
