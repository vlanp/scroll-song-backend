import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (recipient: string, subject: string, text: string) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: recipient,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

export { sendEmail };
