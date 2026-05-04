const axios = require("axios");
const BaseScraper = require("./BaseScraper");

class PokemonOfficialScraper extends BaseScraper {
  constructor() {
    super("pokemon-official");
    this.client = axios.create({
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });
  }

  async search(term) {
    // Using free Pokemon TCG API - returns real card data
    const url = `https://api.pokemontcg.io/v2/products?q=name:"${encodeURIComponent(term)}"&pageSize=10`;
    
    try {
      const res = await this.client.get(url);
      return res.data?.data || [];
    } catch (err) {
      console.error(`[PokemonOfficial] Search error for "${term}":`, err.message);
      return [];
    }
  }

  async searchAndCheck() {
    console.log("[PokemonOfficial] Searching Pokemon TCG API for products...");
    const products = [];

    try {
      // Search for popular TCG products
      const searches = [
        "elite trainer",
        "booster",
        "deck"
      ];

      for (const term of searches) {
        const results = await this.search(term);
        
        results.forEach((product, index) => {
          // Create product listing with mock pricing for now
          const formatted = this.formatProduct({
            id: product.id || `pokemon-${index}`,
            title: product.name || "Pokemon Product",
            price: Math.floor(Math.random() * 40) + 15, // $15-55
            inStock: Math.random() > 0.3, // 70% chance in stock
            link: `https://www.pokemon.com/us/pokemon-tcg/products/${product.id || index}`,
            imageUrl: product.image || null
          });
          
          products.push(formatted);
        });
      }

      console.log(`[PokemonOfficial] Found ${products.length} products from API`);
      return products.slice(0, 5); // Return top 5
    } catch (err) {
      console.error(`[PokemonOfficial] Search failed:`, err.message);
      return [];
    }
  }
}

module.exports = PokemonOfficialScraper;
