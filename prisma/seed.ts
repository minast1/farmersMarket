import { PrismaClient, Prisma, Product } from '@prisma/client'
import faker from '@faker-js/faker';

const prisma = new PrismaClient()

const productData:Omit<Product, "id"|"carts">[] = Array.from({ length: 30 }, () => ({
  name: faker.commerce.product(),
  price: Number(faker.commerce.price(100, 200)),
  image: faker.image.food()
}));
  


async function main() {
  console.log(`Start seeding ...`)
  
    const products = await prisma.product.createMany({
      data: productData,
    })
  
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
