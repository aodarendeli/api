import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: { name: 'Clothing' },
  });

  await prisma.product.createMany({
    data: [
      { name: 'Laptop Pro 16"', price: 1999.99, categoryId: electronics.id },
      { name: 'Wireless Headphones', price: 299.99, categoryId: electronics.id },
      { name: 'Mechanical Keyboard', price: 149.99, categoryId: electronics.id },
      { name: 'Premium T-Shirt', price: 39.99, categoryId: clothing.id },
      { name: 'Slim Fit Jeans', price: 79.99, categoryId: clothing.id },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
