"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function finishOnboard(OnboardingFormData: {
  [key: string]: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  for (const key in OnboardingFormData) {
    await prisma.onboardingResponse.create({
      data: {
        question: key,
        answer: OnboardingFormData[key],
        inputName: key,
        userId: session.user.id,
      },
    });
  }

  redirect("/");
}
