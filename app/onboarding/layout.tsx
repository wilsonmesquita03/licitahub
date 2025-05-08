// app/layout.tsx

import { OnboardingProvider } from "./onboarding-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  );
}
