"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createBoletim(rangeStart: Date, rangeEnd: Date) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return;

  const boletimAlreadyExists = await prisma.sentBoletim.findFirst({
    where: { userId: session.user.id, rangeStart, rangeEnd },
  });

  if (boletimAlreadyExists) return;

  const keywords = await prisma.userKeyword.findFirst({
    where: { userId: session.user.id, default: true },
  });

  if (!keywords) {
    return { message: "Você deve definir suas palavras chaves primeiro" };
  }

  const boletim = await prisma.sentBoletim.create({
    data: {
      color: "",
      rangeEnd,
      rangeStart,
      createdAt: new Date(),
      keywords: keywords.keyword,
      userId: session.user.id,
    },
  });

  redirect(`/boletim/${boletim.id}`);
}

export async function updateKeyowrds(boletimId: string, keywords: string[]) {
  await prisma.sentBoletim.update({
    where: { id: boletimId },
    data: { keywords },
  });

  return { ok: true };
}
