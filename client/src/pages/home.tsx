import { useState } from "react";
import { Camera } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import SelectionForm from "@/components/SelectionForm";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import ProgressScreen from "@/components/ProgressScreen";
import SuccessScreen from "@/components/SuccessScreen";
import ErrorScreen from "@/components/ErrorScreen";
import InfoPanel from "@/components/InfoPanel";
import { CaptureResult } from "@shared/schema";

type Step = "selection" | "confirmation" | "progress" | "success" | "error";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("selection");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [articleCount, setArticleCount] = useState(0);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  const handleFormSubmit = (dept: string, date: string, count: number) => {
    setDepartment(dept);
    setStartDate(date);
    setArticleCount(count);
    setCurrentStep("confirmation");
  };

  const handleConfirm = () => {
    setCurrentStep("progress");
  };

  const handleSuccess = (captureResult: CaptureResult) => {
    setResult(captureResult);
    setCurrentStep("success");
  };

  const handleError = (errorData: { message: string; code: string }) => {
    setError(errorData);
    setCurrentStep("error");
  };

  const handleGoBack = () => {
    setCurrentStep("selection");
  };

  const handleNewCapture = () => {
    setDepartment("");
    setStartDate("");
    setArticleCount(0);
    setResult(null);
    setError(null);
    setCurrentStep("selection");
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case "selection":
        return 1;
      case "confirmation":
        return 2;
      case "progress":
        return 3;
      case "success":
        return 5;
      case "error":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Camera className="text-primary text-3xl" />
              <h1 className="text-2xl font-serif font-bold text-foreground">
                Captures d'écran Articles Le Figaro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <StepIndicator currentStep={getStepNumber()} />

        {currentStep === "selection" && (
          <SelectionForm onSubmit={handleFormSubmit} />
        )}

        {currentStep === "confirmation" && (
          <ConfirmationScreen
            department={department}
            startDate={startDate}
            articleCount={articleCount}
            onConfirm={handleConfirm}
            onGoBack={handleGoBack}
          />
        )}

        {currentStep === "progress" && (
          <ProgressScreen
            department={department}
            startDate={startDate}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}

        {currentStep === "success" && result && (
          <SuccessScreen result={result} onNewCapture={handleNewCapture} />
        )}

        {currentStep === "error" && error && (
          <ErrorScreen error={error} onRetry={handleGoBack} />
        )}

        <InfoPanel />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Captures d'écran Articles Le Figaro. Développé pour automatiser la génération de captures d'écran.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Documentation
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Changelog
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
