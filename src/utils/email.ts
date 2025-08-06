import nodemailer from "nodemailer";

const zohoTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST_ZOHO,
  secure: true,
  port: parseInt(process.env.EMAIL_PORT_ZOHO),
  auth: {
    user: process.env.EMAIL_ADDRESS_ZOHO,
    pass: process.env.EMAIL_PASSWORD_ZOHO,
  },
});

const resendTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST_RESEND,
  secure: true, // Setting secure to false does not mean that you would not use an encrypted connection. Most SMTP servers allow connection upgrade via the STARTTLS command, but to use this, you have to connect using plaintext first. => from https://nodemailer.com/smtp/
  port: parseInt(process.env.EMAIL_PORT_RESEND),
  auth: {
    user: process.env.EMAIL_USERNAME_RESEND,
    pass: process.env.EMAIL_PASSWORD_RESEND,
  },
});

const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  transporterName: "ZOHO" | "RESEND" = "RESEND"
) => {
  const mailOptions = {
    from:
      transporterName === "RESEND"
        ? process.env.EMAIL_ADDRESS_RESEND
        : process.env.EMAIL_ADDRESS_ZOHO,
    to: recipient,
    subject: subject,
    text: text,
  };

  return (
    transporterName === "RESEND" ? resendTransporter : zohoTransporter
  ).sendMail(mailOptions);
};

export { sendEmail };
