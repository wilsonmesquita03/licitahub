// app/onboarding/page.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "./onboarding-provider";
import { OperationStep } from "./components/operation-step";
import { CompanyInfoStep } from "./components/company-info-step";
import { ProductServiceStep } from "./components/product-service-step";
import { ReviewStep } from "./components/review-step";
import { WelcomeStep } from "./components/welcome-step";
import { finishOnboard } from "./action";

export default function OnboardingPage() {
  const { currentStep, steps, nextStep, prevStep, formData } = useOnboarding();

  const handleSubmit = async () => {
    await finishOnboard(formData)
  };

  // No arquivo page.tsx, atualize o switch case:
  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />; // Novo caso
      case 1:
        return <CompanyInfoStep />;
      case 2:
        return <ProductServiceStep />;
      case 3:
        return <OperationStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">
            {steps[currentStep].title}
          </CardTitle>
          <div className="mt-4">
            <Progress value={(currentStep + 1) * (100 / steps.length)} />
            <div className="mt-2 text-sm text-muted-foreground text-center">
              Passo {currentStep + 1} de {steps.length}
            </div>
          </div>
        </CardHeader>

        <CardContent>{getCurrentStepComponent()}</CardContent>

        {steps[currentStep].step != 0 && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Voltar
            </Button>

            <Button
              onClick={
                currentStep === steps.length - 1 ? handleSubmit : nextStep
              }
            >
              {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
