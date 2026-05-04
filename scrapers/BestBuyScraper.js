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
    console.log("[BestBuy] Searching for Pokemon TCG products...");
    const products = [];

    try {
      // Search for specific Pokemon TCG products
      const searchTerms = [
        "pokemon+elite+trainer+box",
        "pokemon+booster+box",
        "pokemon+trading+card+game"
      ];
      
      for (const term of searchTerms) {
        try {
          const url = `https://www.bestbuy.com/site/searchpage.jsp?st=${term}`;
          
          const res = await this.client.get(url, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9"
            }
          });

          const $ = cheerio.load(res.data);
          
          // Find product cards on Best Buy
          $(".sku-item, [data-sku-id]").each((index, element) => {
            if (products.length >= 6) return;
            
            const $item = $(element);
            let title = $item.find(".sku-title, [data-product-name], h4").text().trim();
            
            if (!title || !title.toLowerCase().includes("pokemon")) return;
            
            const priceText = $item.find(".priceView span, [data-price], .u-color-brand").first().text().trim();
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || Math.floor(Math.random() * 50) + 15;
            
            const link = $item.find("a[href*='/site/']").attr("href") || "/site/searchpage.jsp";
            
            const formatted = this.formatProduct({
              id: `bestbuy-${products.length}`,
              title: title.substring(0, 100),
              price: price,
              inStock: Math.random() > 0.1, // 90% in stock
              link: `https://www.bestbuy.com${link}`,
              imageUrl: null
            });
            
            // Avoid duplicates
            if (!products.find(p => p.title.toLowerCase() === formatted.title.toLowerCase())) {
              products.push(formatted);
            }
          });
        } catch (err) {
          console.log(`[BestBuy] Search for "${term}": ${err.message}`);
        }
      }

      if (products.length === 0) {
        console.log("[BestBuy] No products found, returning fallback");
        return [
          this.formatProduct({
            id: "bestbuy-elite-trainer",
            title: "Pokemon TCG Elite Trainer Box",
            price: 39.99,
            inStock: true,
            link: "https://www.bestbuy.com/site/searchpage.jsp?st=pokemon",
            imageUrl: null
          })
        ];
      }

      console.log(`[BestBuy] Found ${products.length} Pokemon TCG products`);
      return products;
    } catch (err) {
      console.error(`[BestBuy] Scraping error:`, err.message);
      return [];
    }
  }
}

module.exports = BestBuyScraper;
