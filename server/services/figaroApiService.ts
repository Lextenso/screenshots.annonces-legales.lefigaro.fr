import { FigaroArticle } from "@shared/schema";
import { addWeeks, isWithinInterval, parse, format } from "date-fns";

export class FigaroApiService {
  private readonly apiUrl = "https://infoslocales.ccmbg.com/export.php";

  async fetchArticles(department: string, startDate: string): Promise<FigaroArticle[]> {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      // Filter articles for the selected department
      const departmentArticles = data[department] || [];
      
      // Calculate the end date (7 weeks from start)
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const end = addWeeks(start, 7);
      
      // Filter articles within the date range
      const filteredArticles = departmentArticles.filter((article: any) => {
        const articleDate = parse(article.date, "dd/MM/yyyy", new Date());
        return isWithinInterval(articleDate, { start, end });
      });
      
      return filteredArticles.map((article: any) => ({
        url: article.url,
        date: article.date,
      }));
    } catch (error) {
      console.error("Error fetching Figaro articles:", error);
      throw new Error("Impossible de récupérer les articles de l'API Le Figaro");
    }
  }

  formatDateForFilename(dateString: string): string {
    // Convert from dd/MM/yyyy to yyyy-MM-dd
    const date = parse(dateString, "dd/MM/yyyy", new Date());
    return format(date, "yyyy-MM-dd");
  }
}
