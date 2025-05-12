// app/layout.tsx

import { OnboardingProvider } from "./onboarding-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
