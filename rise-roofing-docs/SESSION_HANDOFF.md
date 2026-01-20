# Session Handoff

## Project Context
- **QuickClaimsAI** is a roofing insurance claims management SaaS for Rise Roofing Supplements, enabling estimators to track claims, supplements, commissions, and generate reports.
- **Tech Stack**: Next.js 16.1.1, React 19, TypeScript 5, Prisma 5.22.0, Neon PostgreSQL, Clerk Auth, Vercel Blob (file storage), Resend (email), Tailwind CSS, shadcn/ui components
- **Patterns**: Server Actions in `src/actions/`, Zod validation in `src/lib/validations/`, App Router with `(dashboard)` route group, middleware-based auth

## What We're Building/Fixing
The commission calculation system was fundamentally broken - the database schema had all the necessary rate fields (`residentialRate`, `commercialRate`, `reinspectionRate`, `estimateFlatFee` for both Contractor and Estimator models), but these fields were NEVER USED. All calculations used legacy single-percentage fields (`billingPercentage`, `commissionPercentage`), applying the same rate regardless of job type.

**Business Requirement**: Different commission structures based on job type:
- **Reinspection** (roof squares increase, e.g., 5→20): 5% contractor, 1% estimator
- **Supplement** (squares unchanged, line items added): 15%/12.5%/10% contractor, 5% estimator
- **Final Invoice** (build complete): Flat fees + supplement % on RCV difference
- **Estimate Only**: Flat fees based on residential/commercial

## Work Completed

### Phase 1: Commission Engine - COMPLETE

**New File Created:**
- `src/lib/commission-engine.ts` - Core commission calculation logic
  - `determineCommissionType()` - Detects reinspection vs supplement based on roof squares change
  - `calculateCommission()` - Calculates contractor billing and estimator commission using proper rates
  - `buildRateProfile()` - Builds rate profile from contractor/estimator Prisma data
  - `selectRate()` - Selects correct rate based on commission type and property type
  - `decimalToNumberOrNull()` - Safe Prisma Decimal conversion

**Schema Updates (`prisma/schema.prisma`):**
- Line 268: Added `propertyType String @default("residential")` to Claim model
- Lines 338-343: Added to Supplement model:
  - `previousRoofSquares Decimal?` - Previous roof squares
  - `newRoofSquares Decimal?` - New roof squares (if changed)
  - `commissionType String?` - Determined commission type

**Updated Files:**

1. **`src/lib/calculations.ts`** (lines 136-161):
   - Added `previousRoofSquares`, `newRoofSquares` to SUPPLEMENT_DECIMAL_FIELDS
   - Expanded CONTRACTOR_DECIMAL_FIELDS and ESTIMATOR_DECIMAL_FIELDS to include all rate fields

2. **`src/lib/validations/claim.ts`** (lines 56-57):
   - Added `propertyType: z.enum(["residential", "commercial"]).default("residential")`

3. **`src/lib/validations/supplement.ts`** (lines 25-31):
   - Added `previousRoofSquares`, `newRoofSquares`, `previousRoofRCV`, `newRoofRCV`, `roofIncrease`

4. **`src/actions/claims.ts`** (lines 154-199, 242-263):
   - Added import for commission engine
   - `createClaim()` now fetches all rate fields from contractor/estimator
   - Builds rate profiles and calculates initial commission for estimate-only jobs
   - Saves `propertyType` to claim

5. **`src/actions/supplements.ts`** (lines 14-19, 28-128, 188-248):
   - Added import for commission engine
   - `recalculateClaimTotals()` completely rewritten to:
     - Fetch all rate fields from contractor/estimator
     - Detect roof squares changes from supplements
     - Use commission engine for proper rate-based calculation
   - `createSupplement()` updated to:
     - Fetch claim's totalSquares and jobType
     - Save `previousRoofSquares`, `newRoofSquares`, `commissionType`

**Migration:**
- Successfully ran `npx prisma migrate dev --name add-commission-fields`
- Prisma client regenerated

## Current State
- **Where we stopped**: Phase 1 (Commission Engine) is COMPLETE and deployed to database
- **Uncommitted changes**: All changes are uncommitted - need to stage and commit:
  ```
  prisma/schema.prisma
  src/lib/commission-engine.ts (new file)
  src/lib/calculations.ts
  src/lib/validations/claim.ts
  src/lib/validations/supplement.ts
  src/actions/claims.ts
  src/actions/supplements.ts
  ```
- **TypeScript**: Compiles successfully with no errors

## Critical Files & Locations

### Commission Logic (NEW):
- `src/lib/commission-engine.ts` - **NEW** Core commission engine with all business logic
- `src/actions/supplements.ts:28-128` - `recalculateClaimTotals()` uses commission engine
- `src/actions/claims.ts:154-199` - `createClaim()` uses commission engine for estimates

### Schema:
- `prisma/schema.prisma:122-150` - Contractor model with all rate fields
- `prisma/schema.prisma:152-184` - Estimator model with all rate fields
- `prisma/schema.prisma:266-269` - Claim model with `jobType` and `propertyType`
- `prisma/schema.prisma:322-361` - Supplement model with squares tracking

### Validations:
- `src/lib/validations/claim.ts:53-57` - jobType and propertyType enums
- `src/lib/validations/supplement.ts:25-31` - roof squares fields

### UI (NEEDS UPDATES - Phase 2):
- `src/components/claims/claims-table.tsx` - Missing job type, commission amounts, days-in-status columns
- `src/app/(dashboard)/claims/page.tsx` - Claims list page
- `src/app/(dashboard)/claims/[id]/page.tsx` - Claim detail page
- `src/components/claims/claim-form.tsx` - Needs propertyType field
- `src/components/supplements/supplement-form.tsx` - Needs roof squares fields

### Source Documents:
- `C:\Users\Owner\Downloads\Meeting started 2026_01_19 15_31 CST - Notes by Gemini.pdf` - Full meeting transcript with Josh Smith

## Next Steps

### Immediate (Commit Changes):
1. **Commit Phase 1 changes**:
   ```bash
   cd /c/Users/Owner/workspace/QuickClaimsAi/quickclaims-ai
   git add prisma/schema.prisma src/lib/commission-engine.ts src/lib/calculations.ts src/lib/validations/claim.ts src/lib/validations/supplement.ts src/actions/claims.ts src/actions/supplements.ts
   git commit -m "feat: implement commission engine with job-type based rate selection"
   ```

### Phase 2: UI Updates
2. **Update claim form** (`src/components/claims/claim-form.tsx`):
   - Add `propertyType` dropdown (residential/commercial)
   - Wire it to the form state and submission

3. **Update supplement form** (`src/components/supplements/supplement-form.tsx`):
   - Add `previousRoofSquares` field (auto-populated from claim)
   - Add `newRoofSquares` field (optional, for reinspections)
   - Show calculated `commissionType` based on input

4. **Update claims table** (`src/components/claims/claims-table.tsx`):
   - Add Job Type column
   - Add Commission Amount column (contractor + estimator)
   - Add Days in Status column (calculated from `statusChangedAt`)
   - Add Insurance Company column (from carrier relation)

### Phase 3: Populate Rate Data
5. **Set rate values on Contractors and Estimators**:
   - Create admin UI or seed script to populate:
     - `residentialRate` (e.g., 0.15 for 15%)
     - `commercialRate` (e.g., 0.125 for 12.5%)
     - `reinspectionRate` (e.g., 0.05 for 5%)
     - `estimateFlatFee` (e.g., 500.00 for commercial, 199.00 for residential)

### Phase 4: Reports
6. **Create reports directory** - `src/app/(dashboard)/reports/`:
   - `activity/page.tsx` - Activity report
   - `commissions/page.tsx` - Commission report
   - `increases/page.tsx` - RCV increases report
   - `payroll-audit/page.tsx` - Payroll audit report

### Phase 5: Approval Workflow
7. **Build team lead approval queue** - `src/app/(dashboard)/approvals/page.tsx`:
   - Commissions require team lead approval before estimators see them
   - Add approval status to Supplement or create CommissionApproval model

### Phase 6: Past Jobs Import
8. **Determine import format** and build importer:
   - User needs to import past jobs "this week"
   - Ask user for source data format (Excel/CSV/other)

## Environment & Setup

```bash
cd /c/Users/Owner/workspace/QuickClaimsAi/quickclaims-ai
npm install
npm run dev        # Runs on localhost:3000

# Database
npx prisma studio  # View/edit data
npx prisma migrate dev --name <name>  # Run migrations
npx prisma generate  # Regenerate client after schema changes

# TypeScript check
npx tsc --noEmit
```

**Environment Variables**: Check `.env` for:
- `DATABASE_URL` - Neon PostgreSQL connection string
- Clerk keys for auth
- Vercel Blob token for file storage
- Resend API key for email

## Gotchas & Warnings

1. **DO NOT use `billingPercentage` or `commissionPercentage` directly** - These are legacy fields kept for backward compatibility. Always use the commission engine.

2. **Rate fields exist but may be NULL** - The commission engine falls back to `defaultRate` (legacy field) if specific rates are not set. Contractors/Estimators need their rates populated.

3. **Multiple supplements per claim** - Schema supports this (one-to-many), supplements can each have different commission types if roof squares change on some but not others.

4. **Human-in-the-loop is CRITICAL** - Team leads MUST approve commissions before estimators see them or they appear on reports. This workflow is NOT YET IMPLEMENTED.

5. **The .docx file cannot be read** - Use the PDF transcript instead for requirements.

6. **No tests exist** - Consider adding tests for commission calculations.

7. **PropertyType defaults to "residential"** - Existing claims will need updating if they're commercial.

8. **Terminal output in WSL** - The bash terminal has a banner that may hide output. Use `&& echo "SUCCESS"` to verify commands.

## User Preferences

- **User is Dalton Cox** - The developer building this for Rise Roofing Supplements
- **Josh Smith** - Rise Roofing team lead who provided requirements
- **Urgent**: Past jobs import needed "this week"
- **Prefers handoff documents** - Likes being able to start fresh sessions with full context
- **No emojis** - Standard professional communication
- **No time estimates** - Focus on what needs to be done, not how long
