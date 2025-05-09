"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function toggleFollowAction(tenderId: string, isFollowed: boolean) {
  const session = await getSession();

  if (!session.user) return;

  await prisma.tender.update({
    where: {
      id: tenderId,
    },
    data: {
      followedBy: {
        connect: isFollowed ? [] : { id: session.user.id },
        disconnect: isFollowed ? { id: session.user.id } : [],
      },
    },
  });
}
