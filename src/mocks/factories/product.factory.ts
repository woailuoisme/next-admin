import { faker } from "@faker-js/faker";
import { round } from "es-toolkit";

import type { Category } from "@/features/categories";
import type { Product, ProductStatus } from "@/features/products";

const CATEGORY_IMAGES: Record<string, string[]> = {
  "cat-1": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", // Headphones
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80", // Keyboard
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80", // Laptop
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80", // ANC headset
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80", // Earbuds
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80", // Monitor
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80", // Mouse
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80", // Smartphone
  ],
  "cat-2": [
    "https://images.unsplash.com/photo-1580481077197-71b3e85e13d9?w=600&auto=format&fit=crop&q=80", // Standing desk
    "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80", // Ergonomic chair
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80", // Desk setup
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80", // Modern workspace
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80", // Desk lamp
    "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&auto=format&fit=crop&q=80", // Leather desk pad
  ],
  "cat-3": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80", // Backpack
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", // Watch
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80", // Technical tee
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80", // Sneaker
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80", // Sunglasses
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80", // Thermal bottle
  ],
  "cat-4": [
    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80", // Espresso machine
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80", // Ceramic mug
    "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80", // Chef knife
    "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80", // Pour over kettle
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80", // Kitchen cookware
  ],
};

const PRODUCT_PREFIXES = [
  "Aero",
  "Pro",
  "Ultra",
  "Apex",
  "Vanguard",
  "Studio",
  "Omni",
  "Pulse",
  "Nova",
  "Zenith",
  "Quantum",
  "Ergo",
  "Titan",
  "Evo",
  "Stealth",
];

export function createProducts(categories: Category[], count = 100): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const prefix = faker.helpers.arrayElement(PRODUCT_PREFIXES);
    const material = faker.commerce.productMaterial();
    const productType = faker.commerce.product();
    const title = `${prefix} ${material} ${productType}`;

    const price = faker.number.int({ min: 25, max: 799 });
    const costMargin = faker.number.float({
      min: 0.45,
      max: 0.65,
      fractionDigits: 2,
    });
    const costPrice = round(price * costMargin, 2);

    // Status and stock distribution:
    // ~8% out of stock, ~12% low stock (<= 10), ~8% draft, remainder active
    let status: ProductStatus = "active";
    let stock = faker.number.int({ min: 15, max: 200 });

    const roll = faker.number.int({ min: 1, max: 100 });
    if (roll <= 8) {
      status = "out_of_stock";
      stock = 0;
    } else if (roll <= 20) {
      status = "active";
      stock = faker.number.int({ min: 2, max: 10 });
    } else if (roll <= 28) {
      status = "draft";
      stock = faker.number.int({ min: 10, max: 50 });
    }

    const imagePool = CATEGORY_IMAGES[category.id] ?? CATEGORY_IMAGES["cat-1"];
    const imageUrl = imagePool[i % imagePool.length];

    const slug = `${faker.helpers.slugify(title).toLowerCase()}-${i + 1}`;
    const createdAt = faker.date.recent({ days: 150 }).toISOString();

    products.push({
      id: `prod-${i + 1}`,
      title,
      slug,
      description: faker.commerce.productDescription(),
      price,
      costPrice,
      stock,
      categoryId: category.id,
      categoryName: category.name,
      status,
      imageUrl,
      createdAt,
    });
  }

  return products;
}
