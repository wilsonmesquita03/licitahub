import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/prisma/generated/prisma";
import { customSession } from "better-auth/plugins";
import { sendMail } from "./email";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        template: "reset-password",
        context: {
          url,
        },
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.GOOGLE_REDIRECT_URI!,
    },
  },
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      const followedTenders = await prisma.tender.findMany({
        where: {
          followedBy: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const onboardingComplete =
        (await prisma.onboardingResponse.count({})) > 0;

      const keywords = await prisma.userKeyword.findFirst({
        where: {
          userId: user.id,
          default: true,
        },
      });

      return {
        user: {
          ...user,
          followedTenders,
          onboardingComplete,
          keywords: keywords?.keyword,
        },
        session,
      };
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL || ""],
});
