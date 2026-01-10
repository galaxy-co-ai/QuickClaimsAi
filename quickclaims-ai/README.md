# QuickClaims AI

Claims supplement management system for Rise Roofing Supplements.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: Clerk
- **Styling**: Tailwind CSS
- **File Storage**: Vercel Blob
- **Email**: Resend

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Get From |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | [neon.tech](https://neon.tech) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | [clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | [clerk.com](https://dashboard.clerk.com) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Vercel project settings |
| `RESEND_API_KEY` | Resend email API key | [resend.com](https://resend.com) |

### 3. Set Up Database

Generate Prisma client and push schema to database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
quickclaims-ai/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/   # Protected dashboard routes
│   │   └── api/           # API routes (webhooks)
│   ├── components/        # React components
│   │   ├── ui/            # Base UI components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utilities & config
│   │   ├── db.ts          # Prisma client
│   │   ├── auth.ts        # Auth helpers
│   │   ├── calculations.ts # Auto-calc engine
│   │   └── validations/   # Zod schemas
│   └── actions/           # Server Actions (TODO)
└── package.json
```

## Key Features

- **Auto-Calculations**: Dollar per square, commission, billing amounts
- **13-Stage Workflow**: Track claims from submission to completion
- **Real-Time Commission**: Estimators see earnings instantly
- **48-Hour Compliance**: Track update frequency
- **Contractor Billing Reports**: One-click generation

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Push schema to database |
| `npx prisma generate` | Generate Prisma client |

## Documentation

See `/Project Template/docs/planning/` for detailed documentation:

- [Vision & Goals](../Project%20Template/docs/planning/01-vision-and-goals.md)
- [Product Requirements](../Project%20Template/docs/planning/03-product-requirements.md)
- [Data Models](../Project%20Template/docs/planning/08-data-models.md)
- [Technical Architecture](../Project%20Template/docs/planning/07-technical-architecture.md)

## License

Proprietary - Rise Roofing Supplements
