import { Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Building2 className="w-4 h-4" />
            </div>
            LicitaHub
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/auth-layout-bg.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          fill
        />
      </div>
    </div>
  );
}
