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
    host: process.env.EMAIL_HOST_SENDMAILER,
    secure: true,
    port: parseInt(process.env.EMAIL_PORT_SENDMAILER),
    auth: {
        user: process.env.EMAIL_ADDRESS_SENDMAILER,
        pass: process.env.EMAIL_PASSWORD_SENDMAILER,
    },
});
const sendEmail = async (recipient, subject, text, transporterName = "SENDMAILER") => {
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: recipient,
        subject: subject,
        text: text,
    };
    return (transporterName === "SENDMAILER" ? mailersendTransporter : zohoTransporter).sendMail(mailOptions);
};
export { sendEmail };
