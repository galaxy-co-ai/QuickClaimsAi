/**
 * Seed Sample Data Script
 *
 * Creates realistic sample data for demonstration:
 * - Adjusters for carriers
 * - Sample claims in various statuses
 * - Notes for activity tracking
 * - Supplements for some claims
 *
 * Run with: pnpm seed:sample-data
 */

import { PrismaClient, ClaimStatus, LossType, JobType, NoteType, SupplementStatus, AdjusterType } from "@prisma/client";

const prisma = new PrismaClient();

// Sample addresses for claims
const SAMPLE_ADDRESSES = [
  { address: "123 Oak Street", city: "Dallas", state: "TX", zip: "75201" },
  { address: "456 Maple Avenue", city: "Houston", state: "TX", zip: "77002" },
  { address: "789 Pine Road", city: "Austin", state: "TX", zip: "78701" },
  { address: "321 Cedar Lane", city: "San Antonio", state: "TX", zip: "78205" },
  { address: "654 Elm Court", city: "Fort Worth", state: "TX", zip: "76102" },
  { address: "987 Birch Drive", city: "Plano", state: "TX", zip: "75024" },
  { address: "147 Willow Way", city: "Arlington", state: "TX", zip: "76010" },
  { address: "258 Spruce Circle", city: "Irving", state: "TX", zip: "75038" },
  { address: "369 Ash Boulevard", city: "Frisco", state: "TX", zip: "75034" },
  { address: "741 Hickory Trail", city: "McKinney", state: "TX", zip: "75069" },
  { address: "852 Walnut Place", city: "Garland", state: "TX", zip: "75040" },
  { address: "963 Cherry Lane", city: "Grand Prairie", state: "TX", zip: "75050" },
];

// Sample policyholder names
const POLICYHOLDER_NAMES = [
  "John Smith",
  "Maria Garcia",
  "Robert Johnson",
  "Jennifer Williams",
  "Michael Brown",
  "Patricia Davis",
  "David Miller",
  "Linda Wilson",
  "James Moore",
  "Elizabeth Taylor",
  "William Anderson",
  "Barbara Thomas",
];

// Sample adjuster names
const ADJUSTER_NAMES = [
  { first: "Mike", last: "Reynolds" },
  { first: "Sarah", last: "Mitchell" },
  { first: "Tom", last: "Harper" },
  { first: "Lisa", last: "Chen" },
  { first: "James", last: "Williams" },
  { first: "Emily", last: "Rodriguez" },
];

// Claim statuses with weights for realistic distribution
const STATUS_DISTRIBUTION: { status: ClaimStatus; weight: number }[] = [
  { status: "new_supplement", weight: 10 },
  { status: "missing_info", weight: 5 },
  { status: "contractor_review", weight: 8 },
  { status: "supplement_in_progress", weight: 15 },
  { status: "supplement_sent", weight: 12 },
  { status: "awaiting_carrier_response", weight: 15 },
  { status: "reinspection_requested", weight: 5 },
  { status: "reinspection_scheduled", weight: 3 },
  { status: "approved", weight: 10 },
  { status: "final_invoice_pending", weight: 5 },
  { status: "final_invoice_sent", weight: 5 },
  { status: "completed", weight: 7 },
];

function getRandomStatus(): ClaimStatus {
  const totalWeight = STATUS_DISTRIBUTION.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of STATUS_DISTRIBUTION) {
    random -= item.weight;
    if (random <= 0) {
      return item.status;
    }
  }
  return "new_supplement";
}

function getRandomLossType(): LossType {
  const types: LossType[] = ["hail", "wind", "fire", "other"];
  const weights = [50, 35, 10, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return types[i];
    }
  }
  return "hail";
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  date.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
  return date;
}

function generatePhone(): string {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

function generateEmail(name: string): string {
  const [first, last] = name.toLowerCase().split(" ");
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  return `${first}.${last}@${domains[randomInt(0, domains.length - 1)]}`;
}

async function seedAdjusters() {
  console.log("\n👔 Creating sample adjusters...\n");

  const carriers = await prisma.carrier.findMany({ where: { isActive: true } });
  
  if (carriers.length === 0) {
    console.log("   ⚠️  No carriers found. Run seed:carriers first.");
    return [];
  }

  const adjusters: Awaited<ReturnType<typeof prisma.adjuster.create>>[] = [];

  for (const carrier of carriers) {
    // Create 1-2 adjusters per carrier
    const numAdjusters = randomInt(1, 2);
    
    for (let i = 0; i < numAdjusters; i++) {
      const nameIndex = (carriers.indexOf(carrier) * 2 + i) % ADJUSTER_NAMES.length;
      const name = ADJUSTER_NAMES[nameIndex];
      const fullName = `${name.first} ${name.last}`;
      
      // Check if adjuster already exists
      const existing = await prisma.adjuster.findFirst({
        where: { carrierId: carrier.id, name: fullName },
      });

      if (existing) {
        adjusters.push(existing);
        continue;
      }

      const types: AdjusterType[] = ["desk", "field", "independent"];
      const adjuster = await prisma.adjuster.create({
        data: {
          carrierId: carrier.id,
          name: fullName,
          email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@${carrier.name.toLowerCase().replace(/\s+/g, "")}.com`,
          phone: generatePhone(),
          type: types[randomInt(0, 2)],
          isActive: true,
        },
      });

      adjusters.push(adjuster);
      console.log(`   ✅ Created adjuster: ${fullName} (${carrier.name})`);
    }
  }

  return adjusters;
}

async function seedClaims() {
  console.log("\n📋 Creating sample claims...\n");

  // Get required entities
  const contractor = await prisma.contractor.findFirst({ where: { isActive: true } });
  const estimator = await prisma.estimator.findFirst({ where: { isActive: true } });
  const carriers = await prisma.carrier.findMany({ where: { isActive: true } });
  const adjusters = await prisma.adjuster.findMany({ where: { isActive: true } });

  if (!contractor) {
    console.log("   ⚠️  No contractor found. Run seed:test-users first.");
    return [];
  }

  if (!estimator) {
    console.log("   ⚠️  No estimator found. Run seed:test-users first.");
    return [];
  }

  if (carriers.length === 0) {
    console.log("   ⚠️  No carriers found. Run seed:carriers first.");
    return [];
  }

  const claims: Awaited<ReturnType<typeof prisma.claim.create>>[] = [];

  // Create 12 sample claims
  for (let i = 0; i < 12; i++) {
    const addressData = SAMPLE_ADDRESSES[i];
    const policyholderName = POLICYHOLDER_NAMES[i];
    const carrier = carriers[randomInt(0, carriers.length - 1)];
    const carrierAdjusters = adjusters.filter(a => a.carrierId === carrier.id);
    const adjuster = carrierAdjusters.length > 0 
      ? carrierAdjusters[randomInt(0, carrierAdjusters.length - 1)] 
      : null;

    const status = getRandomStatus();
    const lossType = getRandomLossType();
    const totalSquares = randomDecimal(20, 80, 2);
    const dollarPerSquare = randomDecimal(350, 650, 2);
    const roofRCV = totalSquares * dollarPerSquare;
    const initialRCV = roofRCV * randomDecimal(1.1, 1.3, 2);
    
    // For completed/approved claims, add increases
    const hasIncrease = ["approved", "final_invoice_pending", "final_invoice_sent", "completed"].includes(status);
    const increasePercent = hasIncrease ? randomDecimal(0.15, 0.45, 4) : 0;
    const totalIncrease = hasIncrease ? initialRCV * increasePercent : 0;
    const currentTotalRCV = initialRCV + totalIncrease;

    const daysAgo = status === "completed" ? randomInt(30, 90) : randomInt(1, 30);
    const lastActivityHours = status === "new_supplement" ? randomInt(1, 24) : randomInt(2, 72);

    const claim = await prisma.claim.create({
      data: {
        policyholderName,
        policyholderEmail: generateEmail(policyholderName),
        policyholderPhone: generatePhone(),
        lossAddress: addressData.address,
        lossCity: addressData.city,
        lossState: addressData.state,
        lossZip: addressData.zip,
        claimNumber: `CLM-${new Date().getFullYear()}-${String(i + 1).padStart(5, "0")}`,
        policyNumber: `POL-${randomInt(100000, 999999)}`,
        dateOfLoss: randomDate(daysAgo + randomInt(0, 30)),
        lossType,
        contractorId: contractor.id,
        estimatorId: estimator.id,
        carrierId: carrier.id,
        adjusterId: adjuster?.id,
        jobType: "supplement" as JobType,
        status,
        totalSquares,
        roofRCV,
        initialRCV,
        dollarPerSquare,
        currentTotalRCV,
        totalIncrease,
        percentageIncrease: increasePercent,
        contractorBillingAmount: totalIncrease * 0.125,
        estimatorCommission: totalIncrease * 0.05,
        createdAt: randomDate(daysAgo),
        lastActivityAt: new Date(Date.now() - lastActivityHours * 60 * 60 * 1000),
        statusChangedAt: randomDate(Math.min(daysAgo, 14)),
        completedAt: status === "completed" ? randomDate(7) : null,
      },
    });

    claims.push(claim);
    console.log(`   ✅ Created claim: ${policyholderName} - ${status}`);
  }

  return claims;
}

async function seedNotes(claims: Awaited<ReturnType<typeof prisma.claim.create>>[]) {
  console.log("\n📝 Creating sample notes...\n");

  const user = await prisma.user.findFirst({ where: { role: "estimator" } });
  if (!user) {
    console.log("   ⚠️  No user found for notes.");
    return;
  }

  const noteTemplates = [
    { type: "status_change" as NoteType, content: "Claim status updated. Moving to next phase." },
    { type: "carrier_communication" as NoteType, content: "Spoke with adjuster regarding missing line items. They will review and respond within 48 hours." },
    { type: "general" as NoteType, content: "Reviewed scope of loss. Identified additional damage to ridge caps and pipe boots." },
    { type: "internal" as NoteType, content: "Contractor confirmed they can schedule reinspection for next week." },
    { type: "general" as NoteType, content: "Uploaded updated supplement with corrected measurements." },
    { type: "carrier_communication" as NoteType, content: "Received approval notification from carrier. Increase approved at requested amount." },
  ];

  for (const claim of claims) {
    // Add 1-3 notes per claim
    const numNotes = randomInt(1, 3);
    
    for (let i = 0; i < numNotes; i++) {
      const template = noteTemplates[randomInt(0, noteTemplates.length - 1)];
      
      await prisma.note.create({
        data: {
          claimId: claim.id,
          userId: user.id,
          content: template.content,
          type: template.type,
          isInternal: template.type === "internal",
          createdAt: randomDate(14),
        },
      });
    }
  }

  console.log(`   ✅ Created notes for ${claims.length} claims`);
}

async function seedSupplements(claims: Awaited<ReturnType<typeof prisma.claim.create>>[]) {
  console.log("\n💰 Creating sample supplements...\n");

  const user = await prisma.user.findFirst({ where: { role: "estimator" } });
  if (!user) {
    console.log("   ⚠️  No user found for supplements.");
    return;
  }

  // Add supplements to claims that have progressed past initial stages
  const claimsWithSupplements = claims.filter(c => 
    !["new_supplement", "missing_info", "contractor_review"].includes(c.status)
  );

  const supplementDescriptions = [
    "Additional ridge cap replacement required due to storm damage not visible from ground level inspection.",
    "Pipe boot replacements needed - all 5 pipe boots showing cracks and UV damage accelerated by hail impact.",
    "Drip edge replacement along south-facing eave, damaged by wind-driven debris.",
    "Step flashing replacement at chimney junction, showing impact damage and water infiltration.",
    "Additional felt underlayment required per code upgrade in storm-prone area.",
  ];

  for (const claim of claimsWithSupplements) {
    const numSupplements = randomInt(1, 2);
    
    for (let seq = 1; seq <= numSupplements; seq++) {
      const amount = randomDecimal(1500, 8000, 2);
      const previousRCV = Number(claim.initialRCV);
      const newRCV = previousRCV + amount;
      
      const statusMap: Record<string, SupplementStatus> = {
        supplement_sent: "submitted",
        awaiting_carrier_response: "pending",
        approved: "approved",
        final_invoice_pending: "approved",
        final_invoice_sent: "approved",
        completed: "approved",
      };

      await prisma.supplement.create({
        data: {
          claimId: claim.id,
          sequenceNumber: seq,
          amount,
          previousRCV,
          newRCV,
          description: supplementDescriptions[randomInt(0, supplementDescriptions.length - 1)],
          status: statusMap[claim.status] || "draft",
          submittedAt: randomDate(21),
          approvedAt: claim.status === "approved" || claim.status === "completed" ? randomDate(7) : null,
          approvedAmount: claim.status === "approved" || claim.status === "completed" ? amount : null,
          createdById: user.id,
          createdAt: randomDate(28),
        },
      });
    }
  }

  console.log(`   ✅ Created supplements for ${claimsWithSupplements.length} claims`);
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         QuickClaims AI - Sample Data Seed Script           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    // Check for existing claims
    const existingClaims = await prisma.claim.count();
    if (existingClaims > 0) {
      console.log(`\n⚠️  Found ${existingClaims} existing claims.`);
      console.log("   Skipping to avoid duplicates. Delete existing claims first if you want to reseed.\n");
      return;
    }

    await seedAdjusters();
    const claims = await seedClaims();
    
    if (claims.length > 0) {
      await seedNotes(claims);
      await seedSupplements(claims);
    }

    console.log("\n" + "═".repeat(64));
    console.log("\n🎉 Sample data created successfully!\n");
    console.log("📊 Summary:");
    console.log(`   • ${await prisma.adjuster.count()} adjusters`);
    console.log(`   • ${await prisma.claim.count()} claims`);
    console.log(`   • ${await prisma.note.count()} notes`);
    console.log(`   • ${await prisma.supplement.count()} supplements`);
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
