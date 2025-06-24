import { prisma } from "@/lib/prisma";
import Keywords from "./keywords";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Onboarding } from "./onboarding";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="container py-8">
        Você precisa estar logado para ver esta página.
      </div>
    );
  }

  const responses = await prisma.onboardingResponse.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const keywords = await prisma.userKeyword.findFirst({
    where: {
      userId: session.user.id,
      default: true,
    },
  });

  return (
    <div className="container p-8 mx-auto space-y-4">
      <div className="grid grid-cols-2">
        <Onboarding responses={responses} />
        <Keywords
          id={keywords?.id || null}
          keywords={keywords?.keyword || []}
        />
      </div>
    </div>
  );
}
