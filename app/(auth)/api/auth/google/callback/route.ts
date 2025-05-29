import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { generateUUID } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { permanentRedirect, redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=google_code_missing");
  }

  // Troca code por token
  const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
  });

  const { id_token, access_token } = tokenRes.data;

  // Decodifica token para pegar informações do usuário
  const userInfoRes = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const { email, name, sub: googleId } = userInfoRes.data;

  // Verifica se já existe no banco, senão cria
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        picture: userInfoRes.data.picture,
        googleId,
        password: bcrypt.hashSync(generateUUID(), 10),
      },
    });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();

  cookieStore.set("@licitahub:auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL! + "/dashboard");
}
