"use client";

import { createContext, useContext, useState, useMemo } from "react";

type OnboardingStep = {
  step: number;
  title: string;
};

export type OnboardingFormData = {
  companyName: string;
  cnpj: string;
  productServiceDescription: string;
  operationType: "online" | "presencial" | "hibrido";
  annualRevenue: string;
  employeesCount: string;
  // Adicione mais campos conforme necessário
};

type OnboardingContextType = {
  currentStep: number;
  totalSteps: number;
  formData: OnboardingFormData;
  steps: OnboardingStep[];
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    cnpj: "",
    productServiceDescription: "",
    operationType: "online",
    annualRevenue: "",
    employeesCount: "",
  });

  // No arquivo de contexto, atualize os steps:
  const steps: OnboardingStep[] = [
    { step: 0, title: "Bem-vindo" }, // Novo passo
    { step: 1, title: "Informações da Empresa" },
    { step: 2, title: "Produtos/Serviços" },
    { step: 3, title: "Operação" },
    { step: 4, title: "Revisão" },
  ];

  const totalSteps = steps.length;

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const value = useMemo(
    () => ({
      currentStep,
      totalSteps,
      formData,
      steps,
      nextStep,
      prevStep,
      updateFormData,
    }),
    [currentStep, formData]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within a OnboardingProvider");
  }
  return context;
}
