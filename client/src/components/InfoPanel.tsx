import { Clock, Shield } from "lucide-react";

export default function InfoPanel() {
  return (
    <div className="bg-accent border border-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
        <Shield className="text-primary mr-2 w-4 h-4" />
        Informations importantes
      </h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Clock className="text-chart-1 text-sm mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">
              Durée du processus
            </h4>
            <p className="text-xs text-muted-foreground">
              Le temps de capture dépend du nombre d'articles. Comptez environ
              5-10 secondes par article.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
