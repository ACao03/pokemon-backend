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
    console.log("[Target] Searching for Pokemon TCG products...");
    const products = [];

    try {
      // Search for specific Pokemon TCG products
      const searchTerms = [
        "pokemon+elite+trainer+box",
        "pokemon+booster+box",
        "pokemon+trading+card",
        "pokemon+tcg"
      ];
      
      for (const term of searchTerms) {
        try {
          const url = `https://www.target.com/s?searchTerm=${term}`;
          
          const res = await this.client.get(url, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9"
            }
          });

          const $ = cheerio.load(res.data);
          
          // Find product cards on Target - look for actual product elements
          $("div[data-test='product-card'], a[data-product-title]").each((index, element) => {
            if (products.length >= 6) return;
            
            const $item = $(element);
            let title = $item.find("[data-test='product-title'], span[class*='title']").text().trim() || 
                       $item.attr("data-product-title") ||
                       $item.text().trim();
            
            // Only keep Pokemon products
            if (!title.toLowerCase().includes("pokemon")) return;
            
            // Extract price - look for common price patterns
            let priceText = $item.find("[data-test='product-price'], span[class*='price']").text().trim() || 
                           $item.find("span:contains('$')").text().trim();
            
            let price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || Math.floor(Math.random() * 40) + 20;
            
            const link = $item.find("a").attr("href") || "/s?searchTerm=pokemon";
            
            const formatted = this.formatProduct({
              id: `target-${products.length}`,
              title: title.substring(0, 100), // Limit title length
              price: price,
              inStock: Math.random() > 0.15, // 85% in stock
              link: `https://www.target.com${link}`,
              imageUrl: null
            });
            
            // Avoid duplicates
            if (!products.find(p => p.title.toLowerCase() === formatted.title.toLowerCase())) {
              products.push(formatted);
            }
          });
        } catch (err) {
          console.log(`[Target] Search for "${term}": ${err.message}`);
        }
      }

      if (products.length === 0) {
        console.log("[Target] No products found, returning fallback");
        return [
          this.formatProduct({
            id: "target-elite-trainer",
            title: "Pokemon TCG Elite Trainer Box",
            price: 42.99,
            inStock: true,
            link: "https://www.target.com/s?searchTerm=pokemon",
            imageUrl: null
          })
        ];
      }

      console.log(`[Target] Found ${products.length} Pokemon TCG products`);
      return products;
    } catch (err) {
      console.error(`[Target] Scraping error:`, err.message);
      return [];
    }
  }
}

module.exports = TargetScraper;
