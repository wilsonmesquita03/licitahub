"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const BackBtn = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button onClick={handleBack} variant="outline">
      Voltar
    </Button>
  );
};
