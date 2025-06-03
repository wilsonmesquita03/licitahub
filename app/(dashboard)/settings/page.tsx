import { EditResponseDialog } from "@/components/edit-onboarding";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Keywords from "./keywords";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  return (
    <div className="container p-8 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Minhas Respostas do Onboarding
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {responses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {response.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      Resposta:
                    </span>{" "}
                    {response.answer}
                  </p>
                  <EditResponseDialog
                    id={response.id}
                    initialAnswer={response.answer}
                    question={response.question}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <Keywords />
    </div>
  );
}
