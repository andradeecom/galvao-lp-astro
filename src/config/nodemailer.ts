import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: import.meta.env.SMTP_HOST,
  port: parseInt(import.meta.env.SMTP_PORT || "465"), // Use 587 for TLS, 465 for SSL
  secure: true, // Use true if you're connecting over SSL/TLS
  auth: {
    user: import.meta.env.SMTP_USER,
    pass: import.meta.env.SMTP_PASS,
  },
});
