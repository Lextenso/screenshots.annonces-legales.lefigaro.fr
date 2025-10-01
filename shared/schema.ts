import { z } from "zod";

export const captureRequestSchema = z.object({
  department: z.string().min(1, "Le département est requis"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
});

export const figaroArticleSchema = z.object({
  url: z.string().url(),
  date: z.string(),
});

export const captureProgressSchema = z.object({
  total: z.number(),
  completed: z.number(),
  currentArticle: z.number().optional(),
  currentUrl: z.string().optional(),
  currentDate: z.string().optional(),
  stage: z.enum(["fetching", "capturing", "zipping", "uploading", "completed", "error"]),
  estimatedTimeRemaining: z.number().optional(),
});

export const captureResultSchema = z.object({
  success: z.boolean(),
  department: z.string(),
  articlesCaptured: z.number(),
  zipFileName: z.string(),
  zipSize: z.string(),
  totalTime: z.string(),
  downloadUrl: z.string(),
  sftpPath: z.string(),
  uploadDate: z.string(),
  error: z.string().optional(),
});

export type CaptureRequest = z.infer<typeof captureRequestSchema>;
export type FigaroArticle = z.infer<typeof figaroArticleSchema>;
export type CaptureProgress = z.infer<typeof captureProgressSchema>;
export type CaptureResult = z.infer<typeof captureResultSchema>;
