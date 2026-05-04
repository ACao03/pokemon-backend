const axios = require("axios");
const BaseScraper = require("./BaseScraper");

class PokemonOfficialScraper extends BaseScraper {
  constructor() {
    super("pokemon-official");
    this.client = axios.create({
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000
    });
    this.searchTerms = [
      "elite trainer box",
      "starter deck",
      "collection box"
    ];
  }

  async search(term) {
    // Pokemon's official TCG store API
    const url = `https://www.pokemon.com/api/search?q=${encodeURIComponent(term)}`;
    
    try {
      const res = await this.client.get(url);
      return res.data?.results || [];
    } catch (err) {
      console.error(`[PokemonOfficial] Search error:`, err.message);
      return [];
    }
  }

  async checkStock(productId) {
    const url = `https://www.pokemon.com/api/product/${productId}`;
    
    try {
      const res = await this.client.get(url);
      const data = res.data;
      
      if (!data) return null;

      const formatted = this.formatProduct({
        id: productId,
        title: data.name || "Unknown",
        price: data.price || "N/A",
        inStock: data.stock > 0,
        link: `https://www.pokemon.com/us/pokemon-tcg/product/${productId}`,
        imageUrl: data.image || null
      });

      this.updateProduct(productId, formatted);
      return formatted;
    } catch (err) {
      console.error(`[PokemonOfficial] Stock check error:`, err.message);
      return null;
    }
  }

  async searchAndCheck() {
    console.log("[PokemonOfficial] Searching for products...");
    const discovered = [];

    for (const term of this.searchTerms) {
      try {
        const results = await this.search(term);
        discovered.push(...results);
      } catch (err) {
        console.error(`[PokemonOfficial] Search failed for "${term}":`, err.message);
      }
    }

    const unique = new Set(discovered.map(p => p.id).filter(Boolean));
    const checked = [];

    for (const productId of unique) {
      try {
        const result = await this.checkStock(productId);
        if (result) checked.push(result);
      } catch (err) {
        console.error(`[PokemonOfficial] Check failed:`, err.message);
      }
    }

    return checked;
  }
}

module.exports = PokemonOfficialScraper;
