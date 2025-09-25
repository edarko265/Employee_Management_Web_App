import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const finlandCities = [
  'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu', 'Turku', 'Jyväskylä', 'Lahti',
  'Kuopio', 'Pori', 'Lappeenranta', 'Kotka', 'Joensuu', 'Vaasa', 'Hämeenlinna',
  'Porvoo', 'Mikkeli', 'Kokkola', 'Hyvinkää', 'Jyvaskyla', 'Seinäjoki', 'Rovaniemi',
  'Kajaani', 'Kemi', 'Savonlinna', 'Lohja', 'Kouvola', 'Rauma', 'Salo', 'Imatra'
];

async function main() {
  for (const city of finlandCities) {
    await prisma.location.upsert({
      where: { name: city },
      update: {},
      create: { name: city },
    });
  }

  console.log('✅ Finnish cities seeded!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
