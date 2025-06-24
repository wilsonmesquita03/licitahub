"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export async function updateResponses(data: { [key: string]: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return unauthorized();
  }

  const modified: Record<string, string> = {};

  for (const key in data) {
    const response = await prisma.onboardingResponse.findFirst({
      where: {
        inputName: key,
        userId: session.user.id,
      },
    });

    await prisma.onboardingResponse.upsert({
      where: {
        id: response?.id,
      },
      create: {
        question: key,
        inputName: key,
        answer: data[key],
        userId: session.user.id,
      },
      update: {
        answer: data[key],
      },
    });

    modified[key] = data[key];
  }

  return modified;
}
