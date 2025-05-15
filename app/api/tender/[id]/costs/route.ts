import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tenderId = (await params).id;

  if (!tenderId) {
    return new Response("Bad Request", { status: 400 });
  }

  const costs = await prisma.costItem.findMany({
    where: { tenderId, userId: session.user.id },
  });

  return new Response(JSON.stringify(costs), { status: 200 });
}
