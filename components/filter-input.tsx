"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";

export function FilterInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue || "");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", newValue);
      params.set("page", "1"); // reset page
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Filtrar por órgão/entidade..."
      className="w-full md:w-[300px]"
      disabled={isPending}
    />
  );
}
