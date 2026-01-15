/**
 * Seed Base Entities Script
 * 
 * Creates essential contractor and estimator records for the app to function.
 * Run with: npx tsx scripts/seed-base-entities.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏗️  Seeding base entities...\n");

  // Check if contractor exists
  const existingContractor = await prisma.contractor.findFirst();
  if (!existingContractor) {
    const contractor = await prisma.contractor.create({
      data: {
        companyName: "Rise Roofing",
        contactName: "Brad",
        email: "brad@riseclaims.com",
        phone: "555-123-4567",
        billingPercentage: 0.125,
      },
    });
    console.log("   ✅ Created contractor:", contractor.companyName);
  } else {
    console.log("   ⏭️  Contractor already exists:", existingContractor.companyName);
  }

  // Check if estimator exists
  const existingEstimator = await prisma.estimator.findFirst();
  if (!existingEstimator) {
    const estimator = await prisma.estimator.create({
      data: {
        firstName: "Jason",
        lastName: "Galaxy",
        email: "jason@galaxyco.ai",
        commissionPercentage: 0.05,
      },
    });
    console.log("   ✅ Created estimator:", estimator.firstName, estimator.lastName);
  } else {
    console.log("   ⏭️  Estimator already exists:", existingEstimator.firstName, existingEstimator.lastName);
  }

  console.log("\n🎉 Done! You can now create claims.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
