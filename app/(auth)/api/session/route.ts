import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_super_secreta";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("@licitahub:auth_token")?.value;

  if (!token)
    return NextResponse.json({
      status: "unauthenticated",
      user: null,
    });

  try {
    // Decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };

    if (!decoded?.sub) {
      cookieStore.delete("@licitahub:auth_token");

      return NextResponse.json({
        status: "unauthenticated",
        user: null,
      });
    }

    // Busca o usuário com base no ID (sub)
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        followedTenders: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user)
      return NextResponse.json({
        status: "unauthenticated",
        user: null,
      });

    return NextResponse.json({
      status: "authenticated",
      user,
    });
  } catch (error) {
    console.error("Erro ao verificar token:", error);

    return NextResponse.json({
      status: "unauthenticated",
      user: null,
    });
  }
}
