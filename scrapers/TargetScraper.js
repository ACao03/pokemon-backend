const axios = require("axios");
const BaseScraper = require("./BaseScraper");

class TargetScraper extends BaseScraper {
  constructor() {
    super("target");
    this.client = axios.create({
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000
    });
    this.searchTerms = [
      "pokemon elite trainer box",
      "pokemon 151",
      "pokemon booster bundle"
    ];
  }

  async search(term) {
    const url = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v1?key=redsky&keyword=${encodeURIComponent(term)}`;
    
    try {
      const res = await this.client.get(url);
      return res.data?.data?.search?.products || [];
    } catch (err) {
      console.error(`[Target] Search error for "${term}":`, err.message);
      return [];
    }
  }

  async getProduct(tcin) {
    const url = `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=redsky&tcin=${tcin}`;
    
    try {
      const res = await this.client.get(url);
      return res.data?.data?.product || null;
    } catch (err) {
      console.error(`[Target] Product fetch error for TCIN ${tcin}:`, err.message);
      return null;
    }
  }

  async checkStock(tcin) {
    try {
      const product = await this.getProduct(tcin);
      if (!product) return null;

      const title = product.item?.product_description?.title;
      const availability = product.fulfillment?.shipping_options?.availability_status;
      const inStock = availability === "IN_STOCK";
      const link = `https://www.target.com/p/${tcin}`;
      const price = product.price?.current_retail;

      const formatted = this.formatProduct({
        id: tcin,
        title: title || "Unknown",
        price: price || "N/A",
        inStock: inStock,
        link: link,
        imageUrl: product.item?.primary_image_url
      });

      this.updateProduct(tcin, formatted);
      return formatted;
    } catch (err) {
      console.error(`[Target] Stock check error:`, err.message);
      return null;
    }
  }

  async searchAndCheck() {
    const discovered = [];

    for (const term of this.searchTerms) {
      try {
        const results = await this.search(term);
        discovered.push(...results);
      } catch (err) {
        console.error(`[Target] Search failed for "${term}":`, err.message);
      }
    }

    const unique = new Set(discovered.map(p => p.tcin).filter(Boolean));

    const checked = [];
    for (const tcin of unique) {
      try {
        const result = await this.checkStock(tcin);
        if (result) checked.push(result);
      } catch (err) {
        console.error(`[Target] Check failed for TCIN ${tcin}:`, err.message);
      }
    }

    return checked;
  }
}

module.exports = TargetScraper;
