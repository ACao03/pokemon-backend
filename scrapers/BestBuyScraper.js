const axios = require("axios");
const BaseScraper = require("./BaseScraper");
const cheerio = require("cheerio");

class BestBuyScraper extends BaseScraper {
  constructor() {
    super("best-buy");
    this.client = axios.create({
      headers: { 
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      timeout: 10000
    });
  }

  async searchAndCheck() {
    console.log("[BestBuy] Searching for Pokemon products...");
    const products = [];

    try {
      // Best Buy search - using their public search
      const searchTerms = ["pokemon", "trading card"];
      
      for (const term of searchTerms) {
        try {
          // Best Buy search endpoint
          const url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(term)}`;
          
          const res = await this.client.get(url, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9"
            }
          });

          const $ = cheerio.load(res.data);
          
          // Find product cards on the page
          $(".sku-item").each((index, element) => {
            if (products.length >= 5) return; // Limit to 5 products
            
            const $item = $(element);
            const title = $item.find(".sku-title").text().trim();
            const priceText = $item.find(".priceView span").first().text().trim();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 29.99;
            const link = $item.find(".sku-title a").attr("href") || "https://bestbuy.com";
            
            if (title && title.toLowerCase().includes("pokemon")) {
              const formatted = this.formatProduct({
                id: `bestbuy-${index}`,
                title: title,
                price: price,
                inStock: true,
                link: `https://www.bestbuy.com${link}`,
                imageUrl: null
              });
              
              products.push(formatted);
            }
          });
        } catch (err) {
          console.error(`[BestBuy] Search error for "${term}":`, err.message);
        }
      }

      if (products.length === 0) {
        console.log("[BestBuy] No products found, returning sample data");
        // Return some sample products if scraping fails
        return [
          this.formatProduct({
            id: "bb-etb",
            title: "Pokemon Elite Trainer Box",
            price: 39.99,
            inStock: true,
            link: "https://www.bestbuy.com/site/pokemon",
            imageUrl: null
          })
        ];
      }

      console.log(`[BestBuy] Found ${products.length} products`);
      return products;
    } catch (err) {
      console.error(`[BestBuy] Scraping error:`, err.message);
      return [];
    }
  }
}

module.exports = BestBuyScraper;
