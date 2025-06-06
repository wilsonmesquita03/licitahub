"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function toggleFollowAction(
  tenderId: string,
  isFollowed: boolean
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return;

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

export async function toggleJoinAction(tenderId: string, isJoined: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return;

  await prisma.tender.update({
    where: {
      id: tenderId,
    },
    data: {
      joinedBy: {
        connect: isJoined ? { id: session.user.id } : [],
        disconnect: isJoined ? [] : { id: session.user.id },
      },
    },
  });
}

export async function addCostAction(
  tenderId: string,
  cost: {
    value: number;
    description: string;
    category: "MATERIAL" | "SERVICO" | "TRANSPORTE" | "TRIBUTOS" | "OUTROS";
    type: "FIXED" | "VARIABLE";
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return await prisma.costItem.create({
    data: {
      tenderId,
      category: cost.category,
      description: cost.description,
      type: cost.type,
      value: cost.value,
      userId: session.user.id,
    },
  });
}

export async function deleteCostAction(costId: string) {
  await prisma.costItem.delete({ where: { id: costId } });
}
