import type { Express } from "express";
import { createServer, type Server } from "http";
import { captureRequestSchema } from "@shared/schema";
import { ScreenshotService } from "./services/screenshotService";
import { SftpService } from "./services/sftpService";
import { FigaroApiService } from "./services/figaroApiService";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Endpoint to fetch articles count
  app.post("/api/articles/count", async (req, res) => {
    try {
      const { department, startDate } = captureRequestSchema.parse(req.body);
      
      const figaroService = new FigaroApiService();
      const articles = await figaroService.fetchArticles(department, startDate);

      res.json({
        count: articles.length,
        department,
        startDate,
      });
    } catch (error: any) {
      console.error("Error fetching article count:", error);
      res.status(400).json({
        message: error.message || "Erreur lors de la récupération du nombre d'articles",
      });
    }
  });

  // Endpoint to start capture process
  app.post("/api/capture/start", async (req, res) => {
    try {
      const { department, startDate } = captureRequestSchema.parse(req.body);
      
      const screenshotService = new ScreenshotService();
      const sftpService = new SftpService();
      const startTime = Date.now();

      // Set up SSE for progress updates
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      screenshotService.on("progress", (progress) => {
        res.write(`data: ${JSON.stringify({ type: "progress", data: progress })}\n\n`);
      });

      try {
        // Step 1: Capture screenshots
        const filePaths = await screenshotService.captureArticles(department, startDate);

        // Step 2: Create ZIP file
        res.write(`data: ${JSON.stringify({ type: "progress", data: { stage: "zipping", completed: filePaths.length, total: filePaths.length } })}\n\n`);

        const zipFileName = `LeFigaro-département${department}.zip`;
        const zipPath = path.join(process.cwd(), "screenshots", zipFileName);
        
        await createZipFile(filePaths, zipPath);
        
        const stats = fs.statSync(zipPath);
        const zipSize = formatBytes(stats.size);

        // Step 3: Upload to SFTP
        res.write(`data: ${JSON.stringify({ type: "progress", data: { stage: "uploading", completed: filePaths.length, total: filePaths.length } })}\n\n`);

        const remotePath = await sftpService.uploadFile(zipPath, zipFileName);

        // Calculate total time
        const totalTime = formatDuration(Date.now() - startTime);

        // Step 4: Send success result
        const result = {
          success: true,
          department,
          articlesCaptured: filePaths.length,
          zipFileName,
          zipSize,
          totalTime,
          downloadUrl: `https://habilitations.annonces-legales.lefigaro.fr/?${department}`,
          sftpPath: remotePath,
          uploadDate: format(new Date(), "dd/MM/yyyy HH:mm"),
        };

        res.write(`data: ${JSON.stringify({ type: "complete", data: result })}\n\n`);
        res.end();

        // Cleanup
        await screenshotService.cleanup();
        try {
          fs.unlinkSync(zipPath);
        } catch (error) {
          console.error("Error cleaning up ZIP file:", error);
        }

      } catch (error: any) {
        console.error("Capture process error:", error);
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          data: { 
            message: error.message,
            code: error.code || "CAPTURE_ERROR",
          } 
        })}\n\n`);
        res.end();

        await screenshotService.cleanup();
      }

    } catch (error: any) {
      console.error("Error starting capture:", error);
      res.status(400).json({
        message: error.message || "Erreur lors du démarrage de la capture",
      });
    }
  });

  return httpServer;
}

async function createZipFile(filePaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err: Error) => reject(err));

    archive.pipe(output);

    filePaths.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    archive.finalize();
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
