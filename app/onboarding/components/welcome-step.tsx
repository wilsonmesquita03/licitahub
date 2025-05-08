// app/onboarding/components/welcome-step.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useOnboarding } from "../onboarding-provider";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { motion } from "framer-motion";

export function WelcomeStep() {
  const { nextStep } = useOnboarding();

  const avatar = createAvatar(botttsNeutral, {
    seed: "custom-seed",
    // ... outras opções
  }).toDataUri();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center space-y-6"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative w-48 h-48">
          <Image src={avatar} width={192} height={192} alt="Mascote" />
        </div>

        <h2 className="text-3xl font-bold">
          Bem-vindo ao Seu Novo Parceiro em Licitações!
        </h2>

        <p className="text-lg text-muted-foreground">
          Eu sou o{" "}
          <span className="font-semibold text-primary">LicitaGuia</span>, seu
          assistente virtual para encontrar as melhores oportunidades
          governamentais para sua empresa.
        </p>

        <div className="space-y-4 pt-8">
          <h3 className="text-xl font-semibold">Como funciona:</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground text-left mx-auto max-w-md">
            <li>Vamos fazer algumas perguntas rápidas sobre sua empresa</li>
            <li>Entender seu modelo de negócios e operação</li>
            <li>Criar um perfil de busca personalizado</li>
            <li>Encontrar licitações compatíveis automaticamente</li>
          </ul>
        </div>

        <Button size="lg" className="mt-8 animate-pulse" onClick={nextStep}>
          Começar Agora!
        </Button>
      </div>
    </motion.div>
  );
}
