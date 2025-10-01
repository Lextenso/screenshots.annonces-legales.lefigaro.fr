import { spawn } from "child_process";
import { FigaroArticle } from "@shared/schema";
import { FigaroApiService } from "./figaroApiService";
import { EventEmitter } from "events";
import path from "path";
import fs from "fs/promises";

const SHOT_SCRAPER_JS = `document.body.insertAdjacentHTML('beforeend', '<style>.layout_right, #appconsent, .fh-ft__col, #tabbar, #hbv-native-inarticle, .fig-newsletter-box, .fig-ad-content, .fig-ad-content--special, .fig-right, .fig-recommended, .fig-suggested, .fig-seo-footer, .etx-player, .fig-comments, .fig-embed, #bottom, .fh-ft__expanded, .fig-body-link {display:none !important;}  .layout_breadcrumb, .layout_main{grid-column: 2/4;}  .fig-main-col{ max-width:90% !important; } .fig-body, body{margin-bottom:0px !important;} .fig-lazy img[data-srcset], .fig-lazy img[srcset] {transition-duration:0s}</style>'); document.querySelectorAll('.fig-lazy>img').forEach(el => { if (el.getAttribute('data-srcset')!= null) { el.setAttribute('srcset',el.getAttribute('data-srcset'));}});`;

export interface ScreenshotProgress {
  total: number;
  completed: number;
  currentArticle?: number;
  currentUrl?: string;
  currentDate?: string;
  stage: string;
}

export class ScreenshotService extends EventEmitter {
  private figaroService: FigaroApiService;
  private screenshotsDir: string;

  constructor() {
    super();
    this.figaroService = new FigaroApiService();
    this.screenshotsDir = path.join(process.cwd(), "screenshots");
  }

  async ensureScreenshotsDir(): Promise<void> {
    try {
      await fs.access(this.screenshotsDir);
    } catch {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
    }
  }

  async captureScreenshot(
    url: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        url,
        "--width", "1030",
        "--javascript", SHOT_SCRAPER_JS,
        "--output", outputPath,
      ];

      const process = spawn("shot-scraper", args);
      
      let stderr = "";

      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`shot-scraper failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        reject(new Error(`Failed to start shot-scraper: ${error.message}`));
      });
    });
  }

  async captureArticles(
    department: string,
    startDate: string
  ): Promise<string[]> {
    await this.ensureScreenshotsDir();

    this.emit("progress", {
      total: 0,
      completed: 0,
      stage: "fetching",
    });

    // Fetch articles from API
    const articles = await this.figaroService.fetchArticles(department, startDate);

    if (articles.length === 0) {
      throw new Error("Aucun article trouvé pour cette période");
    }

    const filePaths: string[] = [];
    const total = articles.length;

    this.emit("progress", {
      total,
      completed: 0,
      stage: "capturing",
    });

    // Capture screenshots in parallel with a limit
    const concurrency = 3; // Capture 3 at a time to avoid overwhelming the system
    
    for (let i = 0; i < articles.length; i += concurrency) {
      const batch = articles.slice(i, i + concurrency);
      
      const promises = batch.map(async (article, batchIndex) => {
        const index = i + batchIndex + 1;
        const formattedDate = this.figaroService.formatDateForFilename(article.date);
        const filename = `${formattedDate} Département ${department} Le Figaro article ${index}.png`;
        const filePath = path.join(this.screenshotsDir, filename);

        this.emit("progress", {
          total,
          completed: i + batchIndex,
          currentArticle: index,
          currentUrl: article.url,
          currentDate: article.date,
          stage: "capturing",
        });

        await this.captureScreenshot(article.url, filePath);
        
        return filePath;
      });

      const batchResults = await Promise.all(promises);
      filePaths.push(...batchResults);

      this.emit("progress", {
        total,
        completed: i + batch.length,
        stage: "capturing",
      });
    }

    return filePaths;
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.screenshotsDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Error cleaning up screenshots directory:", error);
    }
  }
}
