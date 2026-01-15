import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const claims = await prisma.claim.count();
  const users = await prisma.user.count();
  const carriers = await prisma.carrier.count();
  const contractors = await prisma.contractor.count();
  const estimators = await prisma.estimator.count();
  const adjusters = await prisma.adjuster.count();
  const notes = await prisma.note.count();
  const supplements = await prisma.supplement.count();
  
  console.log("\n📊 Database Contents:");
  console.log("====================");
  console.log("Claims:", claims);
  console.log("Users:", users);
  console.log("Carriers:", carriers);
  console.log("Contractors:", contractors);
  console.log("Estimators:", estimators);
  console.log("Adjusters:", adjusters);
  console.log("Notes:", notes);
  console.log("Supplements:", supplements);
  
  // Show all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, clerkId: true },
  });
  console.log("\nAll Users:", JSON.stringify(allUsers, null, 2));
  
  // Show contractors
  const allContractors = await prisma.contractor.findMany({
    select: { id: true, companyName: true },
  });
  console.log("\nAll Contractors:", JSON.stringify(allContractors, null, 2));
  
  // Show estimators
  const allEstimators = await prisma.estimator.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  console.log("\nAll Estimators:", JSON.stringify(allEstimators, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
