/**
 * Wipe All Clerk Users Script
 * 
 * Deletes all users from Clerk and the local database for a fresh start.
 * Run with: npx tsx scripts/wipe-clerk-users.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         QuickClaims AI - Wipe All Users Script             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  if (!process.env.CLERK_SECRET_KEY) {
    console.error("\n❌ Error: CLERK_SECRET_KEY environment variable is not set");
    process.exit(1);
  }

  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    // Get all Clerk users
    console.log("\n🔍 Fetching all Clerk users...\n");
    
    let allUsers: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const response = await clerk.users.getUserList({ limit, offset });
      allUsers = allUsers.concat(response.data);
      
      if (response.data.length < limit) {
        break;
      }
      offset += limit;
    }
    
    console.log(`   Found ${allUsers.length} Clerk users\n`);
    
    if (allUsers.length === 0) {
      console.log("   No users to delete.\n");
    } else {
      // Delete each Clerk user
      console.log("🗑️  Deleting Clerk users...\n");
      
      for (const user of allUsers) {
        const email = user.emailAddresses?.[0]?.emailAddress || user.id;
        try {
          await clerk.users.deleteUser(user.id);
          console.log(`   ✓ Deleted: ${email}`);
        } catch (error: any) {
          console.log(`   ✗ Failed to delete ${email}: ${error.message}`);
        }
      }
    }
    
    // Clear local database users
    console.log("\n🗑️  Clearing local database users...\n");
    
    // Delete in order to respect foreign key constraints
    await prisma.note.deleteMany({});
    console.log("   ✓ Deleted all notes");
    
    await prisma.document.deleteMany({});
    console.log("   ✓ Deleted all documents");
    
    await prisma.supplement.deleteMany({});
    console.log("   ✓ Deleted all supplements");
    
    await prisma.claim.deleteMany({});
    console.log("   ✓ Deleted all claims");
    
    await prisma.userPreferences.deleteMany({});
    console.log("   ✓ Deleted all user preferences");
    
    await prisma.user.deleteMany({});
    console.log("   ✓ Deleted all users");
    
    await prisma.estimator.deleteMany({});
    console.log("   ✓ Deleted all estimators");
    
    await prisma.contractor.deleteMany({});
    console.log("   ✓ Deleted all contractors");
    
    await prisma.adjuster.deleteMany({});
    console.log("   ✓ Deleted all adjusters");

    console.log("\n" + "═".repeat(64));
    console.log("\n🎉 All users wiped successfully!\n");
    console.log("📝 Next steps:");
    console.log("   1. Sign up with a new account at your app URL");
    console.log("   2. The Clerk webhook will create your user record");
    console.log("   3. You'll be assigned the default 'estimator' role");
    console.log("   4. Manually update your role to 'admin' if needed\n");
    
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
