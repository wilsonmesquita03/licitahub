"use server";
import { prisma } from "@/lib/prisma";

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await prisma.suggestion.findMany({
    where: {
      documentId,
    },
  });

  return suggestions ?? [];
}
