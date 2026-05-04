/**
 * RetailerManager - Handles multiple retailers and consolidates product data
 */

const TargetScraper = require("./TargetScraper");
const BestBuyScraper = require("./BestBuyScraper");
const PokemonOfficialScraper = require("./PokemonOfficialScraper");
const { mockProducts } = require("./mockData");

class RetailerManager {
  constructor() {
    this.scrapers = [
      new TargetScraper(),
      new BestBuyScraper(),
      new PokemonOfficialScraper()
    ];

    // Consolidated product map: key = product title, value = array of retailer listings
    this.consolidatedProducts = new Map();
    this.useMockData = false; // Set to false to use real scrapers
  }

  /**
   * Run all scrapers and consolidate results
   */
  async checkAllRetailers() {
    console.log("🛍️  Checking all retailers...");

    let allProducts = [];

    if (this.useMockData) {
      console.log("📋 Using mock data for demonstration");
      allProducts = mockProducts;
    } else {
      const results = await Promise.allSettled(
        this.scrapers.map(scraper => scraper.searchAndCheck())
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const retailer = this.scrapers[index].name;
          console.log(`✓ ${retailer}: Found ${result.value.length} products`);
          allProducts = allProducts.concat(result.value);
        } else {
          const retailer = this.scrapers[index].name;
          console.error(`✗ ${retailer}: ${result.reason.message}`);
        }
      });

      // Fall back to mock data if no real products found
      if (allProducts.length === 0) {
        console.log("⚠️  No products found from scrapers, using mock data");
        allProducts = mockProducts;
      }
    }

    // Consolidate by product name
    this.consolidatedProducts.clear();
    allProducts.forEach(product => {
      const key = product.title.toLowerCase();
      if (!this.consolidatedProducts.has(key)) {
        this.consolidatedProducts.set(key, []);
      }
      this.consolidatedProducts.get(key).push(product);
    });

    console.log(`📊 Consolidated into ${this.consolidatedProducts.size} unique products`);
    return this.getAllConsolidated();
  }

  /**
   * Get all consolidated products
   */
  getAllConsolidated() {
    const result = [];

    this.consolidatedProducts.forEach((listings, title) => {
      result.push({
        title,
        retailers: listings,
        inStockCount: listings.filter(p => p.inStock).length,
        totalRetailers: listings.length,
        bestPrice: this.findBestPrice(listings),
        links: listings.map(p => ({ retailer: p.retailer, url: p.link }))
      });
    });

    return result.sort((a, b) => b.inStockCount - a.inStockCount);
  }

  /**
   * Find best price from listings
   */
  findBestPrice(listings) {
    const prices = listings
      .map(p => {
        const price = typeof p.price === "string" 
          ? parseFloat(p.price.replace("$", "")) 
          : p.price;
        return { retailer: p.retailer, price };
      })
      .filter(p => !isNaN(p.price));

    if (prices.length === 0) return null;

    return prices.reduce((best, current) =>
      current.price < best.price ? current : best
    );
  }

  /**
   * Get products in stock
   */
  getInStockProducts() {
    return this.getAllConsolidated().filter(p => p.inStockCount > 0);
  }

  /**
   * Get products out of stock
   */
  getOutOfStockProducts() {
    return this.getAllConsolidated().filter(p => p.inStockCount === 0);
  }

  /**
   * Get products for a specific retailer
   */
  getByRetailer(retailerName) {
    const products = [];
    this.consolidatedProducts.forEach(listings => {
      const retailerListing = listings.find(
        p => p.retailer.toLowerCase() === retailerName.toLowerCase()
      );
      if (retailerListing) {
        products.push(retailerListing);
      }
    });
    return products;
  }

  /**
   * Get price comparison for a product
   */
  getPriceComparison(productTitle) {
    const key = productTitle.toLowerCase();
    const listings = this.consolidatedProducts.get(key);
    if (!listings) return null;

    return {
      title: productTitle,
      retailers: listings.map(p => ({
        retailer: p.retailer,
        price: p.price,
        inStock: p.inStock,
        link: p.link
      }))
    };
  }

  /**
   * Get all retailers
   */
  getRetailers() {
    return this.scrapers.map(s => s.name);
  }
}

module.exports = RetailerManager;
