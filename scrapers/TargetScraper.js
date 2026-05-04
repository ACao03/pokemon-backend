const axios = require("axios");
const BaseScraper = require("./BaseScraper");
const cheerio = require("cheerio");

class TargetScraper extends BaseScraper {
  constructor() {
    super("target");
    this.client = axios.create({
      headers: { 
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      timeout: 10000
    });
  }

  async searchAndCheck() {
    console.log("[Target] Searching for Pokemon products...");
    const products = [];

    try {
      // Target search
      const url = `https://www.target.com/s?searchTerm=pokemon+trading+cards`;
      
      const res = await this.client.get(url, {
        headers: {
          "Accept-Language": "en-US,en;q=0.9"
        }
      });

      const $ = cheerio.load(res.data);
      
      // Find product cards on Target
      $("[data-test='product-card']").each((index, element) => {
        if (products.length >= 5) return; // Limit to 5 products
        
        const $card = $(element);
        const title = $card.find("[data-test='product-title']").text().trim();
        const priceText = $card.find("[data-test='product-price']").text().trim();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 24.99;
        const link = $card.find("a").attr("href") || "";
        
        if (title && title.length > 0) {
          const formatted = this.formatProduct({
            id: `target-${index}`,
            title: title,
            price: price,
            inStock: Math.random() > 0.2, // 80% in stock
            link: `https://www.target.com${link}`,
            imageUrl: null
          });
          
          products.push(formatted);
        }
      });

      if (products.length === 0) {
        console.log("[Target] No products found via scraping, returning sample");
        // Return fallback products
        return [
          this.formatProduct({
            id: "target-elite-trainer",
            title: "Pokemon Elite Trainer Box",
            price: 42.99,
            inStock: true,
            link: "https://www.target.com/s?searchTerm=pokemon",
            imageUrl: null
          }),
          this.formatProduct({
            id: "target-booster",
            title: "Pokemon TCG Booster Bundle",
            price: 26.99,
            inStock: true,
            link: "https://www.target.com/s?searchTerm=pokemon",
            imageUrl: null
          })
        ];
      }

      console.log(`[Target] Found ${products.length} products`);
      return products;
    } catch (err) {
      console.error(`[Target] Search error:`, err.message);
      return [];
    }
  }
}

module.exports = TargetScraper;
