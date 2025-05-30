// app/lib/email.ts
import "server-only";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer from "nodemailer";

// Criação do transporter
export const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
