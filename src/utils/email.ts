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

const mailersendTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST_MAILERSEND,
  secure: true,
  port: parseInt(process.env.EMAIL_PORT_MAILERSEND),
  auth: {
    user: process.env.EMAIL_ADDRESS_MAILERSEND,
    pass: process.env.EMAIL_PASSWORD_MAILERSEND,
  },
});

const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  transporterName: "ZOHO" | "MAILERSEND" = "MAILERSEND"
) => {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: recipient,
    subject: subject,
    text: text,
  };

  return (
    transporterName === "MAILERSEND" ? mailersendTransporter : zohoTransporter
  ).sendMail(mailOptions);
};

export { sendEmail };
