"use server";

import { cookies } from "next/headers"; // ou 'next/headers' se estiver no App Router
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Session } from "@/app/session-provider";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_super_secreta";

export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get("@licitahub:auth_token")?.value;

  if (!token)
    return {
      status: "unauthenticated",
      user: null,
    };

  try {
    // Decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };

    if (!decoded?.sub) {
      cookieStore.delete("@licitahub:auth_token");

      return {
        status: "unauthenticated",
        user: null,
      };
    }

    // Busca o usuário com base no ID (sub)
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },
    });

    if (!user)
      return {
        status: "unauthenticated",
        user: null,
      };

    return {
      status: "authenticated",
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return {
      status: "unauthenticated",
      user: null,
    };
  }
}
