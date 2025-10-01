import { Button } from "@/components/ui/button";
import { AlertTriangle, Bug, Lightbulb, RotateCcw, ChevronRight } from "lucide-react";

interface ErrorScreenProps {
  error: { message: string; code: string };
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="bg-card rounded-lg shadow-lg border border-destructive p-8 mb-6 fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="text-destructive text-5xl" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-muted-foreground">
          Le processus de capture n'a pas pu être complété
        </p>
      </div>

      {/* Error Details */}
      <div className="bg-destructive/5 border border-destructive rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Bug className="text-destructive mr-2 w-4 h-4" />
          Détails de l'erreur
        </h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <span className="text-sm text-muted-foreground min-w-24">
              Type :
            </span>
            <span className="text-sm font-semibold text-destructive" data-testid="text-error-type">
              {error.code}
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-sm text-muted-foreground min-w-24">
              Message :
            </span>
            <span className="text-sm text-foreground" data-testid="text-error-message">
              {error.message}
            </span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-accent border border-border rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Lightbulb className="text-chart-3 mr-2 w-4 h-4" />
          Suggestions
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <ChevronRight className="text-primary text-xs mt-1 mr-2 flex-shrink-0" />
            <span>Vérifiez votre connexion internet et réessayez</span>
          </li>
          <li className="flex items-start">
            <ChevronRight className="text-primary text-xs mt-1 mr-2 flex-shrink-0" />
            <span>Assurez-vous que l'API est accessible et opérationnelle</span>
          </li>
          <li className="flex items-start">
            <ChevronRight className="text-primary text-xs mt-1 mr-2 flex-shrink-0" />
            <span>Vérifiez les paramètres SFTP dans la configuration</span>
          </li>
          <li className="flex items-start">
            <ChevronRight className="text-primary text-xs mt-1 mr-2 flex-shrink-0" />
            <span>
              Assurez-vous que shot-scraper est correctement installé
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 shadow-md"
          data-testid="button-retry"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
