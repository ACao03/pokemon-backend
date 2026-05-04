/**
 * Mock product data for demonstration purposes
 */

const mockProducts = [
  {
    id: "mock-etb-1",
    title: "Pokemon Elite Trainer Box",
    price: 39.99,
    inStock: true,
    retailer: "best-buy",
    link: "https://www.bestbuy.com/site/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-etb-2",
    title: "Pokemon Elite Trainer Box",
    price: 42.99,
    inStock: true,
    retailer: "target",
    link: "https://www.target.com/p/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-etb-3",
    title: "Pokemon Elite Trainer Box",
    price: 44.99,
    inStock: false,
    retailer: "pokemon-official",
    link: "https://www.pokemon.com/us/pokemon-tcg/",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-151-1",
    title: "Pokemon 151 Collection Box",
    price: 49.99,
    inStock: true,
    retailer: "best-buy",
    link: "https://www.bestbuy.com/site/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-151-2",
    title: "Pokemon 151 Collection Box",
    price: 51.99,
    inStock: true,
    retailer: "target",
    link: "https://www.target.com/p/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-booster-1",
    title: "Pokemon Booster Bundle",
    price: 24.99,
    inStock: true,
    retailer: "pokemon-official",
    link: "https://www.pokemon.com/us/pokemon-tcg/",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-booster-2",
    title: "Pokemon Booster Bundle",
    price: 22.99,
    inStock: true,
    retailer: "best-buy",
    link: "https://www.bestbuy.com/site/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-starter-1",
    title: "Pokemon TCG Starter Deck",
    price: 14.99,
    inStock: true,
    retailer: "target",
    link: "https://www.target.com/p/pokemon",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  },
  {
    id: "mock-starter-2",
    title: "Pokemon TCG Starter Deck",
    price: 15.99,
    inStock: false,
    retailer: "pokemon-official",
    link: "https://www.pokemon.com/us/pokemon-tcg/",
    lastChecked: new Date().toLocaleTimeString(),
    imageUrl: null
  }
];

module.exports = { mockProducts };
