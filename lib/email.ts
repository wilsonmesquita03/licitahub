import "server-only";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer from "nodemailer";

// Criação do transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: process.env.NODE_ENV === "production", // SSL só em produção
  auth: process.env.SMTP_HOST
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined, // Sem auth no MailDev ou MailHog
});

// Registra helper globalmente
handlebars.registerHelper("formatDate", function (date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
});

// Função para compilar o template
const compileTemplate = (templateName: string, context: any): string => {
  const filePath = path.join(
    process.cwd(),
    "emails",
    "templates",
    `${templateName}.hbs`
  );

  const source = fs.readFileSync(filePath, "utf-8");
  const compiledTemplate = handlebars.compile(source);
  return compiledTemplate(context);
};

// Novo sendMail usando HTML compilado
export const sendMail = async ({
  to,
  subject,
  template,
  context,
}: {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}) => {
  const html = compileTemplate(template, context);

  await transporter.sendMail({
    from: '"LicitaHub" <no-reply@licitahub.com>',
    to,
    subject,
    html,
  });
};
