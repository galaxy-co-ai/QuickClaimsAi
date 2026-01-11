/**
 * Seed script to add the top 10 US home insurance carriers
 * Run with: npx tsx scripts/seed-carriers.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Top 10 US Home Insurance Carriers by market share
const TOP_CARRIERS = [
  {
    name: "State Farm",
    phone: "1-800-732-5246",
    website: "https://www.statefarm.com",
    notes: "Largest home insurance provider in the US. Known for local agent network.",
  },
  {
    name: "Allstate",
    phone: "1-800-255-7828",
    website: "https://www.allstate.com",
    notes: "Second largest US insurer. Offers bundling discounts.",
  },
  {
    name: "USAA",
    phone: "1-800-531-8722",
    website: "https://www.usaa.com",
    notes: "Military members and families only. Highly rated customer service.",
  },
  {
    name: "Liberty Mutual",
    phone: "1-800-290-8711",
    website: "https://www.libertymutual.com",
    notes: "Major national carrier with extensive coverage options.",
  },
  {
    name: "Farmers Insurance",
    phone: "1-888-327-6335",
    website: "https://www.farmers.com",
    notes: "Strong presence in Western and Midwestern states.",
  },
  {
    name: "Nationwide",
    phone: "1-877-669-6877",
    website: "https://www.nationwide.com",
    notes: "Offers broad coverage options and multi-policy discounts.",
  },
  {
    name: "Travelers",
    phone: "1-800-842-5075",
    website: "https://www.travelers.com",
    notes: "One of the oldest US insurers. Strong commercial and personal lines.",
  },
  {
    name: "American Family Insurance",
    phone: "1-800-692-6326",
    website: "https://www.amfam.com",
    notes: "Regional carrier strong in Midwest. Known for customer satisfaction.",
  },
  {
    name: "Erie Insurance",
    phone: "1-800-458-0811",
    website: "https://www.erieinsurance.com",
    notes: "Regional carrier in Mid-Atlantic and Midwest. Highly rated.",
  },
  {
    name: "Chubb",
    phone: "1-800-252-4670",
    website: "https://www.chubb.com",
    notes: "Premium carrier for high-value homes. Excellent claims service.",
  },
];

async function seedCarriers() {
  console.log("\n🏢 Seeding top 10 US home insurance carriers...\n");

  let created = 0;
  let skipped = 0;

  for (const carrier of TOP_CARRIERS) {
    try {
      // Check if carrier already exists
      const existing = await prisma.carrier.findUnique({
        where: { name: carrier.name },
      });

      if (existing) {
        console.log(`   ⏭️  Skipped (already exists): ${carrier.name}`);
        skipped++;
        continue;
      }

      // Create the carrier
      await prisma.carrier.create({
        data: {
          name: carrier.name,
          phone: carrier.phone,
          website: carrier.website,
          notes: carrier.notes,
          isActive: true,
        },
      });

      console.log(`   ✅ Created: ${carrier.name}`);
      created++;
    } catch (error: any) {
      console.error(`   ❌ Failed to create ${carrier.name}:`, error.message);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total:   ${TOP_CARRIERS.length}\n`);
}

async function main() {
  try {
    await seedCarriers();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
