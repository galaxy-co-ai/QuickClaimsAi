/**
 * Seed Test Users Script
 *
 * Creates 4 test users for testing different roles:
 * - Admin
 * - Manager
 * - Estimator
 * - Contractor
 *
 * Run with: pnpm seed:test-users
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

// Test user configurations - using unique passwords to avoid Clerk's breach detection
const TEST_USERS = [
  {
    email: "admin@test.quickclaims.dev",
    password: "QcAdmin2026!xK9m",
    firstName: "Admin",
    lastName: "User",
    role: "admin" as const,
  },
  {
    email: "manager@test.quickclaims.dev",
    password: "QcManager2026!pL7n",
    firstName: "Manager",
    lastName: "User",
    role: "manager" as const,
  },
  {
    email: "estimator@test.quickclaims.dev",
    password: "QcEstimator2026!vR3q",
    firstName: "Estimator",
    lastName: "User",
    role: "estimator" as const,
  },
  {
    email: "contractor@test.quickclaims.dev",
    password: "QcContractor2026!wT5s",
    firstName: "Contractor",
    lastName: "User",
    role: "contractor" as const,
  },
];

async function deleteExistingTestUsers() {
  console.log("\n🧹 Cleaning up existing test users...\n");

  for (const testUser of TEST_USERS) {
    try {
      // Find user in Clerk by email
      const users = await clerk.users.getUserList({
        emailAddress: [testUser.email],
      });

      if (users.data.length > 0) {
        const clerkUser = users.data[0];

        // Delete from database first
        await prisma.user.deleteMany({
          where: { clerkId: clerkUser.id },
        });

        // Delete from Clerk
        await clerk.users.deleteUser(clerkUser.id);
        console.log(`   Deleted existing user: ${testUser.email}`);
      }
    } catch (error) {
      // User might not exist, that's fine
    }
  }
}

async function createTestUsers() {
  console.log("\n👥 Creating test users...\n");

  const createdUsers: Array<{
    email: string;
    password: string;
    role: string;
    clerkId: string;
  }> = [];

  // First, create a contractor company for the contractor user
  let contractor = await prisma.contractor.findFirst({
    where: { email: "contractor@test.quickclaims.dev" },
  });

  if (!contractor) {
    contractor = await prisma.contractor.create({
      data: {
        companyName: "Test Roofing Company",
        contactName: "Contractor User",
        email: "contractor@test.quickclaims.dev",
        phone: "(555) 123-4567",
        billingPercentage: 0.15, // 15%
        isActive: true,
      },
    });
    console.log("   Created test contractor company: Test Roofing Company");
  }

  for (const testUser of TEST_USERS) {
    try {
      // Create user in Clerk with verified email (skip verification)
      const clerkUser = await clerk.users.createUser({
        emailAddress: [testUser.email],
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        publicMetadata: {
          role: testUser.role,
        },
        skipPasswordChecks: true,
        skipEmailVerification: true,
      });

      console.log(`   ✓ Created Clerk user: ${testUser.email} (${testUser.role})`);

      // Create user in database
      const dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
          isActive: true,
          contractorId: testUser.role === "contractor" ? contractor.id : null,
        },
      });

      // For estimator, create an estimator profile
      if (testUser.role === "estimator") {
        await prisma.estimator.create({
          data: {
            userId: dbUser.id,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            email: testUser.email,
            commissionPercentage: 0.05, // 5%
            isActive: true,
          },
        });
        console.log(`   ✓ Created estimator profile for: ${testUser.email}`);
      }

      createdUsers.push({
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
        clerkId: clerkUser.id,
      });

    } catch (error: any) {
      console.error(`   ✗ Failed to create ${testUser.email}:`, error.message);

      // If Clerk error has more details
      if (error.errors) {
        error.errors.forEach((e: any) => {
          console.error(`     - ${e.message}`);
        });
      }
    }
  }

  return createdUsers;
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         QuickClaims AI - Test User Seed Script             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (!process.env.CLERK_SECRET_KEY) {
    console.error("\n❌ Error: CLERK_SECRET_KEY environment variable is not set");
    console.error("   Make sure you have a .env or .env.local file with this variable");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("\n❌ Error: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  try {
    // Delete existing test users first
    await deleteExistingTestUsers();

    // Create new test users
    const users = await createTestUsers();

    if (users.length > 0) {
      console.log("\n" + "═".repeat(64));
      console.log("\n🎉 Test users created successfully!\n");
      console.log("┌─────────────────────────────────────────┬─────────────────────┬────────────┐");
      console.log("│ Email                                   │ Password            │ Role       │");
      console.log("├─────────────────────────────────────────┼─────────────────────┼────────────┤");

      for (const user of users) {
        const email = user.email.padEnd(39);
        const password = user.password.padEnd(19);
        const role = user.role.padEnd(10);
        console.log(`│ ${email} │ ${password} │ ${role} │`);
      }

      console.log("└─────────────────────────────────────────┴─────────────────────┴────────────┘");
      console.log("\n📝 Note: These are test accounts. Do not use in production.\n");
    } else {
      console.log("\n⚠️  No users were created. Check the errors above.\n");
    }

  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
