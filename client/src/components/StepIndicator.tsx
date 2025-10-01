import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Sélection" },
  { number: 2, label: "Confirmation" },
  { number: 3, label: "Capture" },
  { number: 4, label: "Upload" },
  { number: 5, label: "Terminé" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`step-indicator w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                  currentStep > step.number
                    ? "bg-chart-2 text-white"
                    : currentStep === step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`step-indicator-${step.number}`}
              >
                {currentStep > step.number ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-border mx-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
