"use server";

import { prisma } from "@/lib/prisma"; // ajuste o caminho conforme sua estrutura
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export async function signup(prevState: any, formData: FormData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: {
        email: ["Este email já está em uso."],
      },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: true };
}

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function signin(prevState: any, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  let success = false;

  try {
    const parsed = loginSchema.parse(rawData);

    const { email, password } = parsed;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: {
          global: ["Email ou senha incorretos."],
        },
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      return {
        error: {
          global: ["Email ou senha incorretos."],
        },
      };
    }

    const cookieStore = await cookies();

    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || "sua_chave_super_secreta",
      {
        expiresIn: "7d",
      }
    );

    cookieStore.set("@licitahub:auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms (mesmo tempo do token)
    });

    success = true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.flatten().fieldErrors,
      };
    }
  } finally {
    if (success) {
      redirect("/");
    }
  }
}
