"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function toggleNotificationAction(enabled: boolean) {
  const session = await getSession();

  if (!session.user) return;

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
