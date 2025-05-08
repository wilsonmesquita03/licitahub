"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="container flex h-full items-center">
        <Link href="/">
          <div className="w-64 flex items-center gap-2 mr-8">
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-lg">LicitaHub</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
