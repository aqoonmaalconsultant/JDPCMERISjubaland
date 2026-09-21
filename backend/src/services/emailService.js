import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
      : undefined
  });
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`Email skipped; SMTP not configured. To=${to}; Subject=${subject}`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'JDPCMERIS <no-reply@jdpcmeris.local>',
    to,
    subject,
    text,
    html
  });
}
