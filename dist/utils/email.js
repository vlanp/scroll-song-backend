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
    secure: false, // Setting secure to false does not mean that you would not use an encrypted connection. Most SMTP servers allow connection upgrade via the STARTTLS command, but to use this, you have to connect using plaintext first. => from https://nodemailer.com/smtp/
    port: parseInt(process.env.EMAIL_PORT_MAILERSEND),
    auth: {
        user: process.env.EMAIL_ADDRESS_MAILERSEND,
        pass: process.env.EMAIL_PASSWORD_MAILERSEND,
    },
});
const sendEmail = async (recipient, subject, text, transporterName = "MAILERSEND") => {
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: recipient,
        subject: subject,
        text: text,
    };
    return (transporterName === "MAILERSEND" ? mailersendTransporter : zohoTransporter).sendMail(mailOptions);
};
export { sendEmail };
