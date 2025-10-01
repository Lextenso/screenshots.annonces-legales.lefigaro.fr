import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, FileArchive, Download, Copy, Plus, FileText, ExternalLink } from "lucide-react";
import { CaptureResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SuccessScreenProps {
  result: CaptureResult;
  onNewCapture: () => void;
}

export default function SuccessScreen({
  result,
  onNewCapture,
}: SuccessScreenProps) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(result.downloadUrl);
    toast({
      title: "Lien copié",
      description: "Le lien de téléchargement a été copié dans le presse-papiers",
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-6 fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-chart-2/10 mb-4">
          <CheckCircle2 className="text-chart-2 text-5xl" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
          Capture terminée avec succès !
        </h2>
        <p className="text-muted-foreground">
          Toutes les étapes ont été complétées sans erreur
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary" data-testid="text-captured-count">
            {result.articlesCaptured}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Articles capturés
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground" data-testid="text-zip-size">
            {result.zipSize}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Taille du ZIP
          </div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground" data-testid="text-total-time">
            {result.totalTime}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Temps total</div>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-chart-2">100%</div>
          <div className="text-xs text-muted-foreground mt-1">Succès</div>
        </div>
      </div>

      {/* File Information */}
      <div className="bg-accent border border-border rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
          <FileArchive className="text-primary mr-2 w-4 h-4" />
          Fichier généré
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Nom du fichier
            </span>
            <span className="text-sm font-mono font-semibold" data-testid="text-zip-filename">
              {result.zipFileName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Emplacement SFTP
            </span>
            <span className="text-xs font-mono" data-testid="text-sftp-path">
              {result.sftpPath}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Date d'upload
            </span>
            <span className="text-sm" data-testid="text-upload-date">
              {result.uploadDate}
            </span>
          </div>
        </div>
      </div>

      {/* Download Link */}
      <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Download className="text-primary text-2xl mt-1" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Lien de téléchargement
            </h3>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                readOnly
                value={result.downloadUrl}
                className="flex-1 text-sm bg-accent border border-border font-mono"
                data-testid="input-download-url"
              />
              <Button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
                data-testid="button-copy-link"
              >
                <Copy className="mr-1 w-4 h-4" />
                Copier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Ce lien permet de télécharger le fichier ZIP généré
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              className="w-full px-6 py-3 bg-chart-2 text-white hover:opacity-90 shadow-md"
              data-testid="button-open-link"
            >
              <ExternalLink className="mr-2 w-4 h-4" />
              Ouvrir le lien
            </Button>
          </a>
          <Button
            onClick={onNewCapture}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 shadow-md"
            data-testid="button-new-capture"
          >
            <Plus className="mr-2 w-4 h-4" />
            Nouvelle capture
          </Button>
        </div>
      </div>
    </div>
  );
}
