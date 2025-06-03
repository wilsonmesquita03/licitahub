"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function toggleNotificationAction(enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session?.user) return;

  await prisma.userPreferences.upsert({
    where: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
      emailNotification: enabled,
    },
    update: {
      emailNotification: enabled,
    },
  });
}
