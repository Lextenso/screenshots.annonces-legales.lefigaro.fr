import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, ArrowLeft, Camera } from "lucide-react";
import { addWeeks, format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConfirmationScreenProps {
  department: string;
  startDate: string;
  articleCount: number;
  onConfirm: () => void;
  onGoBack: () => void;
}

export default function ConfirmationScreen({
  department,
  startDate,
  articleCount,
  onConfirm,
  onGoBack,
}: ConfirmationScreenProps) {
  const start = new Date(startDate);
  const end = addWeeks(start, 7);
  const formattedStart = format(start, "dd/MM/yyyy", { locale: fr });
  const formattedEnd = format(end, "dd/MM/yyyy", { locale: fr });

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-6 fade-in">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <FileText className="text-primary text-4xl" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Articles trouvés
        </h2>
        <p className="text-muted-foreground">
          Confirmez pour lancer les captures d'écran
        </p>
      </div>

      <div className="bg-muted rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary" data-testid="text-article-count">
              {articleCount}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Articles trouvés
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground" data-testid="text-department">
              {department}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Département
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">7 semaines</div>
            <div className="text-sm text-muted-foreground mt-1">Période</div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date de début :</span>
            <span className="font-semibold">{formattedStart}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Date de fin :</span>
            <span className="font-semibold">{formattedEnd}</span>
          </div>
        </div>
      </div>

      <div className="bg-accent border border-border rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-chart-3 text-lg mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-sm mb-1">
              Attention
            </h4>
            <p className="text-xs text-muted-foreground">
              La capture de {articleCount} articles peut prendre plusieurs
              minutes. Assurez-vous que votre connexion internet est stable et
              que vous disposez de suffisamment d'espace disque.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={onGoBack}
          className="px-6 py-3 bg-muted text-foreground hover:bg-secondary"
          data-testid="button-go-back"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Retour
        </Button>
        <Button
          onClick={onConfirm}
          disabled={articleCount === 0}
          className="px-8 py-3 bg-primary text-primary-foreground hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-start-capture"
        >
          <Camera className="mr-2 w-4 h-4" />
          {articleCount === 0 ? "Aucun article à capturer" : "Lancer les captures"}
        </Button>
      </div>
    </div>
  );
}
