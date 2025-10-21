import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks, CheckCircle2, Circle, X } from "lucide-react";
import { CaptureResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProgressScreenProps {
  department: string;
  startDate: string;
  onSuccess: (result: CaptureResult) => void;
  onError: (error: { message: string; code: string }) => void;
}

interface ProgressData {
  total: number;
  completed: number;
  currentArticle?: number;
  currentUrl?: string;
  currentDate?: string;
  stage: string;
}

export default function ProgressScreen({
  department,
  startDate,
  onSuccess,
  onError,
}: ProgressScreenProps) {
  const { toast } = useToast();
  const [progress, setProgress] = useState<ProgressData>({
    total: 0,
    completed: 0,
    stage: "fetching",
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const startCapture = async () => {
      try {
        const response = await fetch("/api/capture/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department, startDate }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }
          
          if (done) {
            buffer += decoder.decode();
            break;
          }

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.type === "progress") {
                  setProgress(data.data);
                } else if (data.type === "complete") {
                  onSuccessRef.current(data.data);
                  return;
                } else if (data.type === "error") {
                  onErrorRef.current(data.data);
                  return;
                }
              } catch (parseError) {
                console.error("Failed to parse SSE data:", line, parseError);
              }
            }
          }
        }

        if (buffer.startsWith("data: ")) {
          try {
            const data = JSON.parse(buffer.substring(6));
            if (data.type === "complete") {
              onSuccessRef.current(data.data);
            } else if (data.type === "error") {
              onErrorRef.current(data.data);
            }
          } catch (parseError) {
            console.error("Failed to parse final SSE data:", buffer, parseError);
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }
        if (!abortedRef.current) {
          onErrorRef.current({
            message: error.message || "Erreur lors de la capture",
            code: "CAPTURE_ERROR",
          });
        }
      }
    };

    startCapture();

    return () => {
      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {});
      }
      if (controller && !controller.signal.aborted) {
        controller.abort();
      }
    };
  }, [department, startDate]);

  const handleCancel = () => {
    abortedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    toast({
      title: "Processus annulé",
      description: "La capture a été interrompue",
    });
    onError({
      message: "Capture annulée par l'utilisateur",
      code: "USER_CANCELLED",
    });
  };

  const overallProgress =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const stages = [
    {
      id: "fetching",
      label: "Récupération des articles",
      completed: progress.stage !== "fetching",
      active: progress.stage === "fetching",
    },
    {
      id: "capturing",
      label: "Captures d'écran (shot-scraper)",
      completed:
        progress.stage !== "fetching" &&
        progress.stage !== "capturing",
      active: progress.stage === "capturing",
      detail:
        progress.stage === "capturing"
          ? `${progress.completed}/${progress.total} articles`
          : undefined,
    },
    {
      id: "zipping",
      label: "Création du fichier ZIP",
      completed:
        progress.stage !== "fetching" &&
        progress.stage !== "capturing" &&
        progress.stage !== "zipping",
      active: progress.stage === "zipping",
    },
    {
      id: "uploading",
      label: "Upload SFTP",
      completed: progress.stage === "completed",
      active: progress.stage === "uploading",
    },
  ];

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-8 mb-6 fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-chart-1/10 mb-4">
          <Loader2 className="animate-spin text-chart-1 text-4xl" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          Capture en cours
        </h2>
        <p className="text-muted-foreground">
          Veuillez patienter pendant la génération des captures d'écran
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">
            Progression globale
          </span>
          <span className="text-sm font-semibold text-primary" data-testid="text-overall-progress">
            {overallProgress}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="progress-bar h-full bg-primary rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            <span data-testid="text-completed-count">{progress.completed}</span> /{" "}
            <span data-testid="text-total-count">{progress.total}</span> articles
          </span>
        </div>
      </div>

      {/* Current Task */}
      {progress.currentArticle && (
        <div className="bg-muted rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
            <ListChecks className="text-primary mr-2 w-4 h-4" />
            Tâche en cours
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Capture de l'article
              </span>
              <span className="text-xs font-mono bg-accent px-2 py-1 rounded border border-border">
                #{progress.currentArticle}
              </span>
            </div>
            {progress.currentUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">URL en cours</span>
                <a
                  href={progress.currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate max-w-xs"
                >
                  {progress.currentUrl}
                </a>
              </div>
            )}
            {progress.currentDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  Date de publication
                </span>
                <span className="text-xs font-semibold">
                  {progress.currentDate}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage Progress */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <ListChecks className="text-primary mr-2 w-4 h-4" />
          Étapes du processus
        </h3>

        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex items-center space-x-3 p-3 rounded-md border ${
              stage.active
                ? "bg-chart-1/5 border-chart-1"
                : stage.completed
                ? "bg-accent border-border"
                : "bg-muted border-border opacity-50"
            }`}
          >
            <div className="flex-shrink-0">
              {stage.completed ? (
                <CheckCircle2 className="text-chart-2 w-5 h-5" />
              ) : stage.active ? (
                <Loader2 className="animate-spin text-chart-1 w-5 h-5" />
              ) : (
                <Circle className="text-muted-foreground w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${
                  stage.active || stage.completed
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stage.completed
                  ? "Terminé"
                  : stage.active
                  ? stage.detail || "En cours..."
                  : "En attente"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <Button
          variant="destructive"
          onClick={handleCancel}
          className="w-full px-6 py-3"
          data-testid="button-cancel"
        >
          <X className="mr-2 w-4 h-4" />
          Annuler le processus
        </Button>
      </div>
    </div>
  );
}
