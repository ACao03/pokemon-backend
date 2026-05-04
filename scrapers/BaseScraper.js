/**
 * Base scraper class for retailer implementations
 */
class BaseScraper {
  constructor(name) {
    this.name = name; // e.g., "target", "pokemon-official", "best-buy"
    this.products = new Map(); // Store products by SKU/ID
  }

  /**
   * Search for products - must be implemented by subclasses
   */
  async search(term) {
    throw new Error("search() must be implemented");
  }

  /**
   * Get product details - must be implemented by subclasses
   */
  async getProduct(productId) {
    throw new Error("getProduct() must be implemented");
  }

  /**
   * Check if product is in stock
   */
  async checkStock(productId) {
    throw new Error("checkStock() must be implemented");
  }

  /**
   * Format product data to standard format
   */
  formatProduct(raw) {
    return {
      retailer: this.name,
      id: raw.id,
      title: raw.title,
      price: raw.price,
      inStock: raw.inStock,
      link: raw.link,
      lastChecked: new Date().toLocaleTimeString(),
      imageUrl: raw.imageUrl || null
    };
  }

  /**
   * Get all tracked products
   */
  getProducts() {
    return Array.from(this.products.values());
  }

  /**
   * Update product stock
   */
  updateProduct(productId, data) {
    const existing = this.products.get(productId) || {};
    this.products.set(productId, {
      ...existing,
      ...data,
      lastChecked: new Date().toLocaleTimeString()
    });
  }
}

module.exports = BaseScraper;
