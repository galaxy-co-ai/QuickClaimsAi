# QuickClaims AI - Product Requirements Document

**Version:** 1.0
**Date:** January 9, 2026
**Client:** Rise Roofing Supplements
**Prepared for:** Brad Gibson, Jason Pelt
**Prepared by:** GalaxyCo (Dalton Cox)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Goals](#3-vision--goals)
4. [User Personas](#4-user-personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Feature Breakdown](#7-feature-breakdown)
8. [Data Models](#8-data-models)
9. [Workflow & Job Statuses](#9-workflow--job-statuses)
10. [User Interface Requirements](#10-user-interface-requirements)
11. [Technical Architecture](#11-technical-architecture)
12. [Success Metrics & KPIs](#12-success-metrics--kpis)
13. [Constraints & Assumptions](#13-constraints--assumptions)
14. [Phased Roadmap](#14-phased-roadmap)
15. [Glossary](#15-glossary)

---

## 1. Executive Summary

### 1.1 Project Overview

QuickClaims AI is a specialized claims supplement management system designed exclusively for Rise Roofing Supplements (Rise Claims). The platform will replace the current fragmented workflow using Job Nimbus and Excel spreadsheets with a streamlined, purpose-built solution that centers on **increase value tracking** - the core metric that drives Rise's business model.

### 1.2 Business Context

Rise Roofing Supplements was founded in 2020 by experienced roofers frustrated with insurance company underpayments and the overcharging practices of existing supplement companies. Rise works with roofing contractors to maximize insurance claim payouts by identifying scope gaps and negotiating with insurance carriers for proper compensation.

**Revenue Model:**
- Rise charges contractors **10-15%** of the claim increase value
- Rise pays estimators **5%** commission on increase value
- 90% of work is standard supplement jobs; remaining 10% includes reinspections, estimates, and final invoicing

### 1.3 Why Build This?

Existing roofing CRMs (Job Nimbus, Acculynx, Claim Titan) are designed for general roofing operations, not supplementing. They:
- Focus on total revenue rather than **increase value**
- Require extensive manual data manipulation for reporting
- Force redundant data entry across multiple systems
- Lack automated commission calculations based on increases
- Don't track the key performance metric: **Dollar Per Square**

---

## 2. Problem Statement

### 2.1 Primary Problem

**Rise Roofing Supplements' estimators and managers spend 2+ hours daily on manual data manipulation** because their current software (Job Nimbus) cannot:

1. Calculate increase values automatically across multiple supplements
2. Generate commission reports based on increase percentages
3. Produce automated contractor billing reports
4. Track claims by insurance carrier and adjuster for negotiation leverage
5. Allow data fields to "speak to each other" for dynamic calculations

### 2.2 Specific Pain Points

| Pain Point | Current Impact | Frequency |
|------------|----------------|-----------|
| Custom fields don't calculate (e.g., Dollar Per Square) | Manual Excel work for every report | Daily |
| Multiple data entries per increase (RCV + Increase Amount + Total) | 3x data entry, increased errors | Per supplement |
| Can't pull reports by insurance carrier/adjuster | Lost negotiation leverage | Weekly |
| Estimators can't see real-time commission | Confusion, manual calculations | Daily |
| Duplicate data entry in Rise system + contractor CRM | Double workload for estimators | Per job |
| Reports require manual Excel manipulation | Hours wasted, error-prone | Daily |
| No automated contractor billing summaries | Manual report generation | Monthly |

### 2.3 Consequences

- **Operational inefficiency**: 40+ hours/month lost to manual data work
- **Data inconsistencies**: Typos and calculation errors from redundant entry
- **Delayed reporting**: Contractors receive summary reports once monthly instead of real-time
- **Estimator frustration**: Can't easily track their own performance and commission
- **Missed opportunities**: Can't leverage historical data in insurance negotiations

---

## 3. Vision & Goals

### 3.1 Vision Statement

> Within 6 months, Rise Roofing Supplements' internal team will manage all claims, commissions, and contractor reporting through a single, intuitive dashboard that requires **three clicks or less** for any common action - eliminating Excel spreadsheets and reducing data entry by 70%.

### 3.2 Success Criteria

| Metric | Target | Timeframe | Measurement |
|--------|--------|-----------|-------------|
| Time spent on manual reporting | Reduce by 80% | 3 months post-launch | Time tracking comparison |
| Data entry actions per supplement | Reduce from 8+ to 3 | At launch | User testing |
| Estimator commission visibility | Real-time (< 1 click) | At launch | Feature validation |
| Contractor report delivery | Same-day automated | At launch | System logs |
| Error rate in calculations | 0% (automated) | At launch | Audit comparison |
| Daily active estimators | 100% of team | 1 month post-launch | Analytics |

### 3.3 Key Differentiators

| Feature | QuickClaims AI | Job Nimbus | Claim Titan |
|---------|----------------|------------|-------------|
| Increase value as primary metric | Core focus | Afterthought | Partial |
| Auto-calculated Dollar Per Square | Yes | No | No |
| Commission auto-calculation | Yes | No | Partial |
| Contractor billing automation | Yes | No | Yes |
| Three-click workflow | Yes | No | No |
| Carrier/Adjuster analytics | Yes | No | Yes |

### 3.4 Non-Goals (MVP)

| Excluded Feature | Reason | Revisit When |
|------------------|--------|--------------|
| Mobile application | Dashboard-first approach; estimators work from home on desktop | Post-MVP stable release |
| Job Nimbus/Acculynx integration | Adds complexity; focus on core workflow first | Phase 2 |
| Homeowner portal | Rise communicates via contractors | Phase 3 |
| Public adjuster features | Rise explicitly does NOT act as public adjuster | Never |
| Document OCR/auto-parsing | Nice-to-have; manual entry acceptable for MVP | Phase 2+ |
| Multi-company/SaaS deployment | Build for Rise first; productize later | Phase 3+ |

---

## 4. User Personas

### 4.1 Primary Persona: The Estimator

| Attribute | Value |
|-----------|-------|
| **Name** | Marcus Torres |
| **Role** | Estimator/Supplementer at Rise Claims |
| **Work Environment** | Remote (home office), desktop computer |
| **Technical Level** | Intermediate - comfortable with CRMs and estimation software |
| **Primary Goal** | Process supplements efficiently and maximize commission earnings |
| **Key Frustration** | "I enter the same data 3 times and still can't see my commission without asking accounting" |

**Daily Workflow:**
1. Check assigned jobs requiring action (48-hour follow-up requirement)
2. Review insurance scope and photos for new assignments
3. Create supplemental estimate with building code justifications
4. Submit supplement to insurance carrier
5. Log notes and update job status
6. Track multiple claims through various stages

**Pain Points:**
- Cannot see real-time commission balance
- Must manually calculate dollar per square for performance review
- Updates in Rise system must be duplicated in contractor's CRM
- Takes too many clicks to log a simple note or status change

**Success Indicators:**
- Uses system daily without reverting to spreadsheets
- Commission visibility reduces questions to accounting by 90%
- Can complete common actions in 3 clicks or less

---

### 4.2 Secondary Persona: The Operations Manager

| Attribute | Value |
|-----------|-------|
| **Name** | Brad Gibson |
| **Role** | Operations Manager / Owner |
| **Work Environment** | Office and remote |
| **Technical Level** | Intermediate |
| **Primary Goal** | Monitor team performance, ensure 48-hour update compliance, generate accurate billing |

**Daily Workflow:**
1. Review team activity and compliance with update frequency
2. Identify bottlenecks or stuck claims
3. Generate contractor billing reports (monthly)
4. Analyze performance metrics (dollar per square trends)
5. Handle escalated contractor questions

**Pain Points:**
- Creating billing reports requires hours of Excel manipulation
- Can't easily see which estimators are meeting 48-hour update requirements
- Historical data for carrier/adjuster analysis requires manual extraction
- No dashboard view of company-wide KPIs

---

### 4.3 Secondary Persona: The Roofing Contractor

| Attribute | Value |
|-----------|-------|
| **Name** | Jake Mitchell |
| **Role** | Owner of Mitchell Roofing LLC (Rise client) |
| **Work Environment** | Field and office |
| **Technical Level** | Basic to intermediate |
| **Primary Goal** | Know status of claims and receive timely billing information |

**Needs:**
- Daily or real-time updates on claim status
- Clear breakdown of increases obtained
- Monthly billing summary
- Easy document access

**Note:** Contractors are NOT direct system users in MVP. They receive automated reports via email. Future phases may include a contractor portal.

---

### 4.4 Anti-Personas (Not Target Users)

| Anti-Persona | Why Not a Fit | How to Recognize |
|--------------|---------------|------------------|
| General roofing companies wanting full CRM | System is supplement-focused, not full roofing operations | Ask about sales pipeline, production scheduling |
| Public adjusters | Rise explicitly states they don't act as public adjusters | Legal/policy discussions with insurers |
| Insurance companies | System tracks claims against carriers | Industry identification |
| Individual homeowners | Rise works B2B with contractors | Direct damage claims |

---

## 5. Functional Requirements

### 5.1 Must Have (P0) - MVP Core

#### Claims Management

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F01 | User can create a new claim/job | Claim created with required fields (policyholder, address, contractor, initial RCV, total squares) in < 1 minute | Estimator use case |
| F02 | User can view and manage assigned claims | Filterable list by status, contractor, estimator, date range | Estimator daily workflow |
| F03 | User can log supplements (increases) on a claim | Each supplement records: date, amount, new total RCV; system auto-calculates increase value | Core business model |
| F04 | System auto-calculates key metrics | Dollar per square, total increase, % increase auto-computed on data entry | Pain point: manual Excel |
| F05 | User can update job status | Single-click status transitions with timestamp logging | 48-hour compliance |
| F06 | User can add notes/timeline entries | Quick note entry (< 3 clicks); notes display chronologically | Estimator workflow |
| F07 | User can upload and attach documents | Support for PDF, images; organized by type (scope, agreement, photos, invoices) | Document requirements |

#### Contractor Management

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F08 | User can create/edit contractor profiles | Store: name, contact info, billing percentage (10-15%), payment terms | Contractor billing |
| F09 | User can view all claims for a contractor | Contractor detail page shows all associated claims with totals | Manager reporting |
| F10 | System generates contractor billing report | Auto-generated report showing: job, increase, billing amount; exportable | Pain point: manual reports |

#### Estimator/Salesperson Management

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F11 | User can create/edit estimator profiles | Store: name, commission percentage (typically 5%) | Commission tracking |
| F12 | Estimator can view their own commission summary | Real-time dashboard showing: jobs, increases, commission earned | Pain point: no visibility |
| F13 | System calculates commission automatically | Commission = increase amount x estimator percentage; updates on each supplement | Core business model |

#### Insurance Carrier & Adjuster Tracking

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F14 | User can log insurance carrier per claim | Dropdown selection with ability to add new carriers | Carrier analytics |
| F15 | User can log adjuster per claim | Free text or selection; associated with carrier | Adjuster analytics |
| F16 | User can view claims grouped by carrier/adjuster | Filterable reports showing historical outcomes by carrier/adjuster | Negotiation leverage |

#### Authentication & Access Control

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F17 | Users can log in with email/password | Secure authentication with session management | Security |
| F18 | Role-based access control | Roles: Admin, Manager, Estimator; permissions enforced | Manager persona |
| F19 | Estimators see only their assigned claims by default | Can view own claims; managers see all | Role-based access |

---

### 5.2 Should Have (P1) - Important Enhancements

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F20 | Kanban board view of claims by status | Drag-and-drop status updates; visual workflow | Visual job board |
| F21 | Dashboard with KPIs | Show: total increases, avg dollar per square, claims by status, 48-hour compliance | Manager overview |
| F22 | Automated email notifications to contractors | Configurable triggers for status changes, increases | Contractor communication |
| F23 | Job type categorization | Supplement (default), Reinspection, Estimate, Final Invoice - with type-specific fields | 10% non-supplement work |
| F24 | Search and quick filters | Search by policyholder, address, claim number; saved filter views | Efficiency |
| F25 | Activity log for audit trail | All changes logged with user, timestamp, before/after values | Compliance |

---

### 5.3 Could Have (P2) - Nice to Have

| ID | Requirement | Acceptance Criteria | Traces To |
|----|-------------|---------------------|-----------|
| F26 | Dark mode | Toggle between light/dark themes | User preference |
| F27 | Keyboard shortcuts | Common actions accessible via documented shortcuts | Power users |
| F28 | Export to CSV/Excel | All list views exportable | Data portability |
| F29 | Custom report builder | Drag-and-drop fields to create custom reports | Advanced reporting |
| F30 | Calendar view of follow-up dates | Visual calendar showing claims requiring action | Time management |

---

### 5.4 Won't Have (P3) - Out of Scope for MVP

| ID | Feature | Reason | Revisit When |
|----|---------|--------|--------------|
| F31 | Mobile app | Desktop-first; estimators work from home | After stable web launch |
| F32 | Job Nimbus/Acculynx sync | Complex; requires API work | Phase 2 |
| F33 | Payment processing | Rise uses external billing; just need reports | If requested |
| F34 | Contractor portal login | Contractors receive reports via email | Phase 3 |
| F35 | Document OCR parsing | Manual entry acceptable | Phase 2+ |
| F36 | AI supplement suggestions | Focus on workflow first | Future |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target | Priority |
|--------|--------|----------|
| Page load time | < 2 seconds on standard broadband | P0 |
| API response time | < 300ms for 95th percentile | P0 |
| Time to create new claim | < 1 minute | P0 |
| Status update action | < 500ms | P0 |
| Report generation (up to 1000 claims) | < 5 seconds | P1 |

### 6.2 Reliability

| Metric | Target | Priority |
|--------|--------|----------|
| Uptime | 99.5% (allows ~1.8 days downtime/year) | P0 |
| Data persistence | No data loss on unexpected shutdown | P0 |
| Auto-save | Notes/forms auto-save every 30 seconds | P1 |
| Error recovery | Graceful error handling with user-friendly messages | P0 |

### 6.3 Security

| Requirement | Implementation | Priority |
|-------------|----------------|----------|
| Authentication | Secure session-based auth; password hashing | P0 |
| Authorization | Role-based access control enforced server-side | P0 |
| Data in transit | HTTPS/TLS 1.3 for all connections | P0 |
| Data at rest | Database encryption | P1 |
| Session management | Sessions expire after 24 hours inactivity | P0 |
| Input validation | All user input sanitized; parameterized queries | P0 |

### 6.4 Usability

| Requirement | Target | Priority |
|-------------|--------|----------|
| Three-click rule | All common actions achievable in 3 clicks or less | P0 |
| Keyboard navigation | All features accessible via keyboard | P1 |
| Loading indicators | Show spinner for operations > 500ms | P0 |
| Error messages | All errors show actionable guidance | P0 |
| Responsive design | Functional on screens 1024px and wider | P0 |

### 6.5 Browser Support

| Browser | Minimum Version | Priority |
|---------|-----------------|----------|
| Chrome | Last 2 major versions | P0 |
| Firefox | Last 2 major versions | P0 |
| Safari | Last 2 major versions | P1 |
| Edge | Last 2 major versions | P1 |

---

## 7. Feature Breakdown

### 7.1 Feature Index

| ID | Feature Name | Priority | Effort | Dependencies |
|----|--------------|----------|--------|--------------|
| F001 | User Authentication | P0 | M | None |
| F002 | User/Role Management | P0 | M | F001 |
| F003 | Contractor CRUD | P0 | M | F001 |
| F004 | Estimator/Salesperson CRUD | P0 | S | F001 |
| F005 | Claim Creation | P0 | L | F003, F004 |
| F006 | Claim List View | P0 | M | F005 |
| F007 | Claim Detail View | P0 | L | F005 |
| F008 | Supplement Entry | P0 | M | F007 |
| F009 | Auto-Calculations Engine | P0 | M | F008 |
| F010 | Job Status Management | P0 | M | F007 |
| F011 | Notes/Timeline System | P0 | M | F007 |
| F012 | Document Upload | P0 | M | F007 |
| F013 | Insurance Carrier Management | P0 | S | F005 |
| F014 | Adjuster Management | P0 | S | F013 |
| F015 | Contractor Billing Report | P0 | L | F003, F008 |
| F016 | Estimator Commission Dashboard | P0 | M | F004, F008 |
| F017 | Kanban Board View | P1 | M | F006, F010 |
| F018 | Manager Dashboard | P1 | L | F006, F009 |
| F019 | Email Notifications | P1 | M | F010 |
| F020 | Search & Filters | P1 | M | F006 |
| F021 | Activity Audit Log | P1 | M | All |

**Effort Key:** S = Small (< 8 hours), M = Medium (8-24 hours), L = Large (24-72 hours)

---

### 7.2 Feature Dependency Graph

```
[Authentication Layer]
F001 (Auth) ─────────────────────────────────────────────┐
     │                                                    │
     ├──► F002 (User/Roles)                              │
     │                                                    │
     ├──► F003 (Contractors) ────────────────────────────┤
     │         │                                          │
     ├──► F004 (Estimators) ─────────────────────────────┤
     │         │                                          │
     └─────────┴──► F005 (Claim Creation) ───────────────┤
                         │                                │
                         ├──► F006 (Claim List) ─────────┤
                         │         │                      │
                         │         └──► F017 (Kanban) ◄──┤
                         │         └──► F020 (Search)     │
                         │                                │
                         └──► F007 (Claim Detail) ───────┤
                                   │                      │
                                   ├──► F008 (Supplements)│
                                   │         │            │
                                   │         └──► F009 (Auto-Calc)
                                   │         │            │
                                   │         └──► F015 (Billing Report)
                                   │         │            │
                                   │         └──► F016 (Commission Dashboard)
                                   │                      │
                                   ├──► F010 (Status Mgmt)│
                                   │         │            │
                                   │         └──► F019 (Notifications)
                                   │                      │
                                   ├──► F011 (Notes)      │
                                   │                      │
                                   ├──► F012 (Documents)  │
                                   │                      │
                                   ├──► F013 (Carriers)   │
                                   │         │            │
                                   │         └──► F014 (Adjusters)
                                   │                      │
                                   └──► F021 (Audit Log) ◄┘

[Aggregation Layer]
F018 (Manager Dashboard) ◄── F006, F009, F010
```

### 7.3 MVP Critical Path

```
F001 → F003 → F005 → F007 → F008 → F009 → F015 (Contractor Billing)
       F004 ─────────────────────────────────► F016 (Commission Dashboard)
```

**Critical MVP Features (must ship together):**
1. Authentication (F001)
2. Contractor Management (F003)
3. Estimator Management (F004)
4. Claim CRUD (F005, F006, F007)
5. Supplement Entry with Auto-Calc (F008, F009)
6. Status Management (F010)
7. Notes System (F011)
8. Contractor Billing Report (F015)
9. Commission Dashboard (F016)

---

## 8. Data Models

### 8.1 Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │  Contractor │       │  Estimator  │
│─────────────│       │─────────────│       │─────────────│
│ id          │       │ id          │       │ id          │
│ email       │       │ name        │       │ userId (FK) │
│ password    │       │ company     │       │ commission% │
│ role        │       │ billing%    │       │             │
│ estimatorId?│       │ contactInfo │       │             │
└─────────────┘       └─────────────┘       └─────────────┘
                             │                     │
                             │ 1:N                 │ 1:N
                             ▼                     ▼
                      ┌───────────────────────────────┐
                      │            Claim              │
                      │───────────────────────────────│
                      │ id                            │
                      │ policyholderName              │
                      │ policyholderAddress           │
                      │ claimNumber                   │
                      │ contractorId (FK)             │
                      │ estimatorId (FK)              │
                      │ carrierId (FK)                │
                      │ adjusterId (FK)?              │
                      │ jobType (enum)                │
                      │ status (enum)                 │
                      │ totalSquares                  │
                      │ initialRCV                    │
                      │ currentTotalRCV (computed)    │
                      │ totalIncrease (computed)      │
                      │ dollarPerSquare (computed)    │
                      │ roofRCV                       │
                      │ createdAt                     │
                      │ updatedAt                     │
                      │ lastActivityAt                │
                      └───────────────────────────────┘
                         │           │           │
                         │ 1:N       │ 1:N       │ 1:N
                         ▼           ▼           ▼
              ┌───────────────┐ ┌─────────┐ ┌──────────┐
              │  Supplement   │ │  Note   │ │ Document │
              │───────────────│ │─────────│ │──────────│
              │ id            │ │ id      │ │ id       │
              │ claimId (FK)  │ │ claimId │ │ claimId  │
              │ amount        │ │ userId  │ │ type     │
              │ previousRCV   │ │ content │ │ filename │
              │ newRCV        │ │ createdAt│ │ url     │
              │ description   │ └─────────┘ │ uploadedAt│
              │ submittedAt   │             └──────────┘
              │ approvedAt?   │
              │ status        │
              └───────────────┘

┌─────────────┐       ┌─────────────┐
│  Carrier    │       │  Adjuster   │
│─────────────│       │─────────────│
│ id          │ 1:N   │ id          │
│ name        │───────│ carrierId   │
│ claimCount  │       │ name        │
└─────────────┘       │ email?      │
                      │ phone?      │
                      └─────────────┘
```

### 8.2 Core Entity Definitions

#### User
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'estimator';
  estimatorProfileId?: string; // Links to Estimator if role is estimator
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

#### Contractor
```typescript
interface Contractor {
  id: string;
  companyName: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  billingPercentage: number; // 10-15%, stored as decimal (0.10-0.15)
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Estimator
```typescript
interface Estimator {
  id: string;
  userId: string; // Links to User account
  commissionPercentage: number; // Typically 5%, stored as decimal (0.05)
  hireDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Computed (via aggregation)
  totalClaimsProcessed?: number;
  totalIncreaseValue?: number;
  totalCommissionEarned?: number;
  averageDollarPerSquare?: number;
}
```

#### Claim
```typescript
interface Claim {
  id: string;

  // Policyholder Info
  policyholderName: string;
  policyholderEmail?: string;
  policyholderPhone?: string;
  lossAddress: string;
  lossCity: string;
  lossState: string;
  lossZip: string;

  // Claim Info
  claimNumber?: string;
  dateOfLoss?: Date;
  lossType?: 'hail' | 'wind' | 'fire' | 'other';

  // Relationships
  contractorId: string;
  estimatorId: string;
  carrierId: string;
  adjusterId?: string;

  // Job Classification
  jobType: 'supplement' | 'reinspection' | 'estimate' | 'final_invoice';
  status: ClaimStatus;

  // Financial - Roof Specific
  totalSquares: number;
  roofRCV: number; // Roof-only RCV for dollar per square calculation

  // Financial - Full Claim
  initialRCV: number; // Original insurance estimate total
  currentTotalRCV: number; // Current total after supplements (computed)
  totalIncrease: number; // Sum of all supplement amounts (computed)
  percentageIncrease: number; // totalIncrease / initialRCV * 100 (computed)
  dollarPerSquare: number; // roofRCV / totalSquares (computed)

  // Billing (computed)
  contractorBillingAmount: number; // totalIncrease * contractor.billingPercentage
  estimatorCommission: number; // totalIncrease * estimator.commissionPercentage

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  statusChangedAt: Date;
  completedAt?: Date;
}

type ClaimStatus =
  | 'new_supplement'
  | 'missing_info'
  | 'contractor_review'
  | 'supplement_in_progress'
  | 'supplement_sent'
  | 'awaiting_carrier_response'
  | 'reinspection_requested'
  | 'reinspection_scheduled'
  | 'approved'
  | 'final_invoice_pending'
  | 'final_invoice_sent'
  | 'completed'
  | 'closed_lost';
```

#### Supplement
```typescript
interface Supplement {
  id: string;
  claimId: string;

  // Financial
  amount: number; // The increase amount
  previousRCV: number; // RCV before this supplement
  newRCV: number; // RCV after this supplement

  // Details
  description: string;
  lineItems?: SupplementLineItem[];

  // Status
  status: 'draft' | 'submitted' | 'pending' | 'approved' | 'denied' | 'partial';
  submittedAt?: Date;
  approvedAt?: Date;
  approvedAmount?: number; // May differ from requested amount

  // Metadata
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

interface SupplementLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  buildingCode?: string;
  notes?: string;
}
```

#### Note
```typescript
interface Note {
  id: string;
  claimId: string;
  userId: string;
  content: string;
  type: 'general' | 'status_change' | 'carrier_communication' | 'internal';
  isInternal: boolean; // If true, not shown to contractors
  createdAt: Date;
  updatedAt: Date;
}
```

#### Document
```typescript
interface Document {
  id: string;
  claimId: string;

  // File Info
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // bytes
  url: string; // Storage URL

  // Classification
  type: 'insurance_scope' | 'signed_agreement' | 'measurement_report' |
        'photo_inspection' | 'supplement_estimate' | 'material_invoice' |
        'final_invoice' | 'carrier_correspondence' | 'other';

  // Metadata
  uploadedBy: string; // User ID
  uploadedAt: Date;
  description?: string;
}
```

#### Carrier & Adjuster
```typescript
interface Carrier {
  id: string;
  name: string; // e.g., "State Farm", "Allstate"
  claimCount: number; // Denormalized for performance
  createdAt: Date;
}

interface Adjuster {
  id: string;
  carrierId: string;
  name: string;
  email?: string;
  phone?: string;
  type?: 'desk' | 'field' | 'independent';
  claimCount: number; // Denormalized
  createdAt: Date;
}
```

### 8.3 Computed Fields Logic

```typescript
// On Claim - recalculated when supplements change
claim.currentTotalRCV = claim.initialRCV + sum(claim.supplements.map(s => s.approvedAmount || s.amount));
claim.totalIncrease = claim.currentTotalRCV - claim.initialRCV;
claim.percentageIncrease = (claim.totalIncrease / claim.initialRCV) * 100;
claim.dollarPerSquare = claim.roofRCV / claim.totalSquares;
claim.contractorBillingAmount = claim.totalIncrease * contractor.billingPercentage;
claim.estimatorCommission = claim.totalIncrease * estimator.commissionPercentage;
```

---

## 9. Workflow & Job Statuses

### 9.1 Claim Status Workflow

```
                                    ┌──────────────────┐
                                    │  NEW_SUPPLEMENT  │ ◄── Claim Created
                                    └────────┬─────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              │              │
                     ┌────────────────┐      │              │
                     │  MISSING_INFO  │──────┘              │
                     └────────────────┘                     │
                                                            ▼
                                              ┌──────────────────────┐
                                              │ SUPPLEMENT_IN_PROGRESS│
                                              └───────────┬──────────┘
                                                          │
                                                          ▼
                                              ┌──────────────────────┐
                                              │  CONTRACTOR_REVIEW   │ (optional)
                                              └───────────┬──────────┘
                                                          │
                                                          ▼
                                              ┌──────────────────────┐
                                              │   SUPPLEMENT_SENT    │
                                              └───────────┬──────────┘
                                                          │
                                                          ▼
                                              ┌──────────────────────┐
                                              │AWAITING_CARRIER_RESPONSE│
                                              └───────────┬──────────┘
                                                          │
                          ┌───────────────────────────────┼───────────────────┐
                          ▼                               ▼                   ▼
              ┌──────────────────────┐      ┌─────────────────┐    ┌────────────┐
              │REINSPECTION_REQUESTED│      │    APPROVED     │    │CLOSED_LOST │
              └──────────┬───────────┘      └────────┬────────┘    └────────────┘
                         │                           │
                         ▼                           │
              ┌──────────────────────┐               │
              │REINSPECTION_SCHEDULED│               │
              └──────────┬───────────┘               │
                         │                           │
                         └───────────────────────────┤
                                                     ▼
                                        ┌────────────────────────┐
                                        │ FINAL_INVOICE_PENDING  │
                                        └───────────┬────────────┘
                                                    │
                                                    ▼
                                        ┌────────────────────────┐
                                        │   FINAL_INVOICE_SENT   │
                                        └───────────┬────────────┘
                                                    │
                                                    ▼
                                        ┌────────────────────────┐
                                        │       COMPLETED        │
                                        └────────────────────────┘
```

### 9.2 Status Definitions

| Status | Description | Required Action | Next States |
|--------|-------------|-----------------|-------------|
| `new_supplement` | New claim just submitted | Gather required docs | `missing_info`, `supplement_in_progress` |
| `missing_info` | Waiting on contractor for docs | Contact contractor | `new_supplement`, `supplement_in_progress` |
| `supplement_in_progress` | Estimator actively working | Create supplement estimate | `contractor_review`, `supplement_sent` |
| `contractor_review` | Waiting for contractor approval | Contractor must review | `supplement_sent`, `supplement_in_progress` |
| `supplement_sent` | Submitted to insurance carrier | Wait for response | `awaiting_carrier_response` |
| `awaiting_carrier_response` | Waiting on carrier | Follow up per 48-hour rule | `reinspection_requested`, `approved`, `closed_lost` |
| `reinspection_requested` | Carrier wants re-inspection | Schedule with homeowner | `reinspection_scheduled` |
| `reinspection_scheduled` | Re-inspection date set | Attend/wait for results | `approved`, `awaiting_carrier_response` |
| `approved` | Carrier approved supplement | Prepare final invoice | `final_invoice_pending` |
| `final_invoice_pending` | Build complete, ready to invoice | Create final invoice | `final_invoice_sent` |
| `final_invoice_sent` | Invoice sent to carrier | Wait for payment | `completed` |
| `completed` | Claim fully resolved | Archive | (terminal) |
| `closed_lost` | Claim lost/cancelled | Document reason | (terminal) |

### 9.3 48-Hour Follow-Up Rule

Rise commits to updating every active claim every 48 hours. The system must:

1. **Track last activity date** for each claim
2. **Flag claims** approaching or exceeding 48 hours since last update
3. **Display visual indicator** (red/yellow/green) in claim lists
4. **Generate compliance report** for managers

```typescript
// 48-hour compliance logic
function getComplianceStatus(claim: Claim): 'compliant' | 'warning' | 'overdue' {
  const hoursSinceActivity = (Date.now() - claim.lastActivityAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceActivity > 48) return 'overdue';
  if (hoursSinceActivity > 36) return 'warning';
  return 'compliant';
}
```

---

## 10. User Interface Requirements

### 10.1 Design System

QuickClaims AI will use the **GalaxyCo Design System** which includes:
- 70 MagicUI animated components
- 27 shadcn/ui base components
- React 18+, TypeScript, Tailwind CSS, Framer Motion

### 10.2 Core Views

#### Dashboard (Manager View)
```
┌────────────────────────────────────────────────────────────────────────────┐
│ QuickClaims AI                                    [Search...]  [Brad ▼]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Active     │ │  Total      │ │  Avg $/SQ   │ │  48hr       │          │
│  │  Claims     │ │  Increase   │ │  This Month │ │  Compliance │          │
│  │    142      │ │  $1.2M      │ │   $714      │ │    94%      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ Claims Requiring Attention                                   [View All]│
│  │─────────────────────────────────────────────────────────────────────── │
│  │ ⚠ Smith, John - 123 Main St      Overdue (52 hrs)      [Open]        │ │
│  │ ⚠ Johnson, Mary - 456 Oak Ave    Warning (40 hrs)      [Open]        │ │
│  │ ● Davis, Tom - 789 Pine Rd       New Supplement        [Open]        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌─────────────────────────────┐ ┌────────────────────────────────────────┤
│  │ Claims by Status            │ │ Recent Activity                       │ │
│  │ ───────────────────────────│ │ ────────────────────────────────────── │
│  │ New Supplement      ████ 12│ │ 10:30 Marcus updated claim #1234      │ │
│  │ In Progress      ██████ 28│ │ 10:15 Supplement approved $4,200      │ │
│  │ Awaiting Response ████ 45 │ │ 09:45 New claim assigned to Sarah     │ │
│  │ Approved           ███ 15 │ │ 09:30 Final invoice sent #1189        │ │
│  └─────────────────────────────┘ └────────────────────────────────────────┤
└────────────────────────────────────────────────────────────────────────────┘
```

#### Claim List View
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Claims                                              [+ New Claim]         │
├────────────────────────────────────────────────────────────────────────────┤
│ [All Statuses ▼] [All Contractors ▼] [All Estimators ▼] [Date Range ▼]   │
│ [Search by name, address, claim #...]                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  │ Status    │ Policyholder    │ Contractor   │ Initial │ Increase │ $/SQ │
│  │───────────│─────────────────│──────────────│─────────│──────────│──────│
│  │ ● Approved│ Smith, John     │ Renegade     │ $18,500 │ $4,200   │ $714 │
│  │ ○ Sent    │ Johnson, Mary   │ Mitchell     │ $22,000 │ $2,800   │ $689 │
│  │ ⚠ Awaiting│ Davis, Tom      │ Renegade     │ $15,000 │ $0       │ $428 │
│  │ ● New     │ Williams, Sue   │ Premier      │ $31,000 │ $0       │ $556 │
│                                                                            │
│  [← Previous]                                    [Page 1 of 12]  [Next →] │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Claim Detail View
```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Claims                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ SMITH, JOHN                                          Status: [Approved ▼] │
│ 123 Main Street, Austin, TX 78701                                         │
│ Claim #: ABC-123456 | State Farm | Adj: Mike Wilson                       │
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┤
│ │ Summary                                                                 │
│ │ ─────────────────────────────────────────────────────────────────────── │
│ │  Contractor: Renegade Roofing (12.5%)    Estimator: Marcus T. (5%)     │
│ │                                                                         │
│ │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │  │ Initial RCV   │ │ Current RCV   │ │ Total Increase│ │ $/Square    │ │
│ │  │   $18,500     │ │   $22,700     │ │    $4,200     │ │   $714      │ │
│ │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
│ │                                                                         │
│ │  Billing: $525.00          Commission: $210.00                         │
│ └─────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [Supplements] [Documents] [Timeline] [Details]                            │
│ ─────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│ SUPPLEMENTS                                                [+ Add Supplement]
│ ┌─────────────────────────────────────────────────────────────────────────┤
│ │ #1 - Submitted 01/05/2026                           Status: Approved   │
│ │     Amount: $3,200 | Items: Starter, I&W, Steep charges                │
│ │ #2 - Submitted 01/08/2026                           Status: Approved   │
│ │     Amount: $1,000 | Items: Decking replacement (4 sheets)             │
│ └─────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ TIMELINE                                                    [+ Add Note]  │
│ ┌─────────────────────────────────────────────────────────────────────────┤
│ │ 01/09 10:30 │ Status changed to Approved                    [Marcus]   │
│ │ 01/08 14:15 │ Supplement #2 approved by carrier             [System]   │
│ │ 01/07 09:00 │ Called adjuster, waiting on review            [Marcus]   │
│ │ 01/05 16:00 │ Supplement #1 sent to carrier                 [Marcus]   │
│ │ 01/04 11:30 │ Received measurement report from contractor   [Marcus]   │
│ │ 01/03 09:00 │ Claim created and assigned                    [System]   │
│ └─────────────────────────────────────────────────────────────────────────┤
└────────────────────────────────────────────────────────────────────────────┘
```

#### Estimator Commission Dashboard
```
┌────────────────────────────────────────────────────────────────────────────┐
│ My Commission                                         January 2026        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Claims     │ │  Total      │ │  Commission │ │  Avg $/SQ   │          │
│  │  Worked     │ │  Increase   │ │  Earned     │ │             │          │
│  │    18       │ │  $42,800    │ │   $2,140    │ │   $698      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                            │
│  Commission Breakdown                                                      │
│  ──────────────────────────────────────────────────────────────────────── │
│  │ Claim           │ Contractor   │ Increase   │ Commission │ Status     │
│  │─────────────────│──────────────│────────────│────────────│────────────│
│  │ Smith, John     │ Renegade     │ $4,200     │ $210.00    │ Completed  │
│  │ Johnson, Mary   │ Mitchell     │ $2,800     │ $140.00    │ Approved   │
│  │ Davis, Tom      │ Renegade     │ $6,500     │ $325.00    │ Completed  │
│  │                                              │            │            │
│  │                                    TOTAL:    │ $2,140.00  │            │
│  ──────────────────────────────────────────────────────────────────────── │
└────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Three-Click Rule Implementation

| Common Action | Click Path |
|---------------|------------|
| View claim details | Claims list → Click claim row |
| Add note to claim | Claim detail → "Add Note" button → Type & submit |
| Update claim status | Claim detail → Status dropdown → Select new status |
| Log supplement | Claim detail → "Add Supplement" → Enter amount & submit |
| View commission | Dashboard header → "My Commission" |
| Generate contractor report | Contractors → Select → "Generate Report" |

### 10.4 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Desktop | 1280px+ | Full sidebar, multi-column layouts |
| Laptop | 1024px - 1279px | Collapsible sidebar, reduced columns |
| Tablet | 768px - 1023px | Hidden sidebar (hamburger menu) |
| Mobile | < 768px | Out of scope for MVP |

---

## 11. Technical Architecture

### 11.1 Architecture Pattern

**Primary Pattern:** Server-Side Rendered (SSR) Web Application

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser (Client)                               │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    React + Next.js App Router                          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │  │  UI Layer   │ │ State Mgmt  │ │  Forms      │ │  Data Fetching  │  │ │
│  │  │ (MagicUI +  │ │ (React      │ │ (React Hook │ │  (Server        │  │ │
│  │  │  shadcn/ui) │ │  Context)   │ │  Form)      │ │   Components)   │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Next.js Application Server                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  App Router │ │ Server      │ │ Server      │ │    API Routes       │   │
│  │  (Pages)    │ │ Actions     │ │ Components  │ │    (/api/...)       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
│                                      │                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ Auth        │ │ Validation  │ │ Business    │ │   Calculations      │   │
│  │ (NextAuth)  │ │ (Zod)       │ │ Logic       │ │   Engine            │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
              ┌────────────┐  ┌────────────────┐  ┌────────────┐
              │ PostgreSQL │  │  File Storage  │  │  Email     │
              │ (Supabase  │  │  (Supabase     │  │  (Resend)  │
              │  or Neon)  │  │   Storage)     │  │            │
              └────────────┘  └────────────────┘  └────────────┘
```

### 11.2 Tech Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Framework** | Next.js | 15.x | SSR, App Router, Server Actions, excellent DX |
| **Language** | TypeScript | 5.x | Type safety, IDE support, error prevention |
| **UI Components** | GalaxyCo Design System | local | Pre-built MagicUI + shadcn/ui components |
| **Styling** | Tailwind CSS | 3.x | Utility-first, design system integration |
| **Animation** | Framer Motion | 11.x | Already in design system |
| **Database** | PostgreSQL | 16.x | Relational data, JSON support, proven reliability |
| **ORM** | Prisma | 5.x | Type-safe queries, excellent migrations |
| **Auth** | NextAuth.js (Auth.js) | 5.x | Built for Next.js, credential provider |
| **Forms** | React Hook Form + Zod | latest | Performance, validation |
| **File Storage** | Supabase Storage or S3 | - | Document uploads |
| **Email** | Resend | - | Transactional emails for notifications |
| **Hosting** | Vercel | - | Optimized for Next.js, easy deployment |

### 11.3 Key Architectural Decisions

#### Decision 1: Next.js App Router over SPA
- **Context**: Need fast initial load, SEO not critical but good DX
- **Choice**: Next.js 15 with App Router and Server Components
- **Rationale**: Server Components reduce client bundle, Server Actions simplify data mutations, built-in routing
- **Trade-offs**: Learning curve for Server Components, more complex than pure SPA

#### Decision 2: PostgreSQL over NoSQL
- **Context**: Data is inherently relational (claims → supplements, contractors → claims)
- **Choice**: PostgreSQL via Supabase or Neon
- **Rationale**: Strong relationships, complex queries needed for reporting, ACID compliance
- **Trade-offs**: Schema migrations required, less flexible than document stores

#### Decision 3: Prisma ORM
- **Context**: Need type-safe database access with good DX
- **Choice**: Prisma 5.x
- **Rationale**: Excellent TypeScript integration, visual schema, automatic migrations
- **Trade-offs**: Some query limitations, abstraction overhead

#### Decision 4: Monolithic over Microservices
- **Context**: Small team, focused application, MVP speed
- **Choice**: Single Next.js application
- **Rationale**: Simpler deployment, faster development, easier debugging
- **Trade-offs**: May need to split later if scale demands

### 11.4 Folder Structure

```
quickclaims-ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes (login, etc.)
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── claims/
│   │   │   │   ├── page.tsx          # Claims list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx      # Claim detail
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx      # New claim form
│   │   │   ├── contractors/
│   │   │   ├── estimators/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Dashboard home
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── webhooks/
│   │   ├── globals.css
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/
│   │   ├── ui/                       # From design system
│   │   ├── magicui/                  # From design system
│   │   ├── claims/                   # Claim-specific components
│   │   │   ├── claim-card.tsx
│   │   │   ├── claim-form.tsx
│   │   │   ├── claim-status-badge.tsx
│   │   │   ├── supplement-form.tsx
│   │   │   └── timeline.tsx
│   │   ├── contractors/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── navigation.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── auth.ts                   # Auth configuration
│   │   ├── utils.ts                  # Utility functions
│   │   ├── calculations.ts           # Business logic calculations
│   │   └── validations/              # Zod schemas
│   │       ├── claim.ts
│   │       ├── contractor.ts
│   │       └── supplement.ts
│   │
│   ├── actions/                      # Server Actions
│   │   ├── claims.ts
│   │   ├── contractors.ts
│   │   ├── supplements.ts
│   │   └── reports.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-claims.ts
│   │   └── use-commission.ts
│   │
│   └── types/                        # TypeScript types
│       ├── claim.ts
│       ├── contractor.ts
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/
│   └── seed.ts                       # Seed data
│
├── public/
│   └── ...
│
├── .env.example
├── .env.local                        # Local environment
├── next.config.js
├── tailwind.config.ts                # Extended from design system
├── tsconfig.json
└── package.json
```

---

## 12. Success Metrics & KPIs

### 12.1 Business Metrics

| Metric | Baseline (Current) | Target (3 months) | Target (6 months) |
|--------|-------------------|-------------------|-------------------|
| Time to create new claim | ~5 minutes | < 1 minute | < 1 minute |
| Time to generate monthly billing | ~4 hours | < 5 minutes | < 1 minute (automated) |
| Data entry actions per supplement | 8+ clicks/fields | 3-4 clicks/fields | 3 clicks |
| 48-hour compliance rate | ~85% (manual tracking) | > 95% | > 98% |
| Estimator time on admin tasks | ~2 hours/day | < 30 minutes/day | < 15 minutes/day |
| Calculation errors | ~5% (manual Excel) | 0% | 0% |

### 12.2 Key Performance Indicators (Rise Business)

These are the KPIs that Rise tracks for their business that the system must surface:

| KPI | Description | Formula | Dashboard Location |
|-----|-------------|---------|-------------------|
| **Dollar Per Square** | Primary performance metric | Roof RCV / Total Squares | Claim detail, estimator dashboard, reports |
| **Total Increase** | Sum of approved supplement amounts | Sum(Supplement.approvedAmount) | Claim detail, reports |
| **Percentage Increase** | Increase relative to initial | (Total Increase / Initial RCV) * 100 | Claim detail |
| **Estimator Commission** | Earnings for estimator | Total Increase * Commission % | Estimator dashboard |
| **Contractor Billing** | Amount owed by contractor | Total Increase * Billing % | Contractor reports |
| **Claims by Status** | Volume at each stage | Count by status | Manager dashboard |
| **48-Hour Compliance** | Claims updated within 48 hrs | Claims compliant / Total active | Manager dashboard |
| **Claims by Carrier** | Volume per insurance company | Count by carrier | Analytics/reports |
| **Average Increase by Adjuster** | Performance tracking | Avg(Increase) grouped by adjuster | Analytics/reports |

### 12.3 System Health Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Page load time (p95) | < 2s | > 3s |
| API response time (p95) | < 300ms | > 500ms |
| Error rate | < 0.1% | > 1% |
| Uptime | 99.5% | < 99% |

---

## 13. Constraints & Assumptions

### 13.1 Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Must use GalaxyCo Design System | Component selection limited to what's available | Design system is comprehensive; custom components can be added |
| Desktop-first (no mobile MVP) | Estimators must use laptop/desktop | All estimators work remotely on desktops already |
| Single database (no sharding) | Scale limited to ~100K claims | Sufficient for Rise's volume; can migrate later |
| File storage limited by hosting | Large documents (>50MB) may have issues | Compress images, limit upload sizes |

### 13.2 Business Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Small team (1 developer initially) | Development velocity limited | Prioritize MVP ruthlessly; use existing design system |
| Rise is only initial customer | Feature requests specific to Rise | Design with future SaaS in mind but don't over-engineer |
| Budget constraints | Limited hosting/infrastructure spend | Use serverless/managed services; scale with usage |

### 13.3 Assumptions

| Assumption | If Wrong... | Validation |
|------------|-------------|------------|
| Estimators have reliable internet | Would need offline support | Confirmed in meeting - work from home |
| 90% of work is standard supplements | Job type flexibility may be insufficient | Build supplement first, extend later |
| Contractors don't need portal access | Feature gap | Email reports sufficient per Brad |
| Excel export sufficient for complex reporting | Would need custom report builder | Start with standard reports |
| 5-10 concurrent users initially | Performance issues unlikely | Monitor and scale as needed |

### 13.4 Dependencies

| Dependency | Type | Risk Level | Mitigation |
|------------|------|------------|------------|
| Vercel hosting | Infrastructure | Low | Standard provider, easy to migrate |
| PostgreSQL (Supabase/Neon) | Database | Low | Standard SQL, portable |
| NextAuth.js | Auth library | Low | Well-maintained, standard patterns |
| Prisma | ORM | Medium | Could switch to raw SQL if needed |
| GalaxyCo Design System | UI components | Low | Owned internally |
| Resend | Email | Low | Easy to swap email providers |

---

## 14. Phased Roadmap

### Phase 1: MVP Core (Target: 4-6 weeks)

**Goal:** Replace Excel and manual calculations with working system

**Features:**
- [ ] User authentication (login/logout)
- [ ] Contractor CRUD
- [ ] Estimator CRUD
- [ ] Claim creation with all required fields
- [ ] Claim list with filters
- [ ] Claim detail view
- [ ] Supplement entry
- [ ] Auto-calculations (increase, dollar per square, commission, billing)
- [ ] Status management
- [ ] Notes/timeline
- [ ] Basic document upload
- [ ] Estimator commission dashboard
- [ ] Contractor billing report (exportable)

**Success Criteria:**
- Rise team can create and manage claims entirely in system
- No Excel needed for daily operations
- Commissions viewable in real-time

---

### Phase 2: Enhanced Experience (Target: 2-4 weeks after Phase 1)

**Goal:** Improve efficiency and add manager insights

**Features:**
- [ ] Kanban board view
- [ ] Manager dashboard with KPIs
- [ ] 48-hour compliance tracking
- [ ] Carrier/adjuster analytics
- [ ] Email notifications for status changes
- [ ] Advanced search and saved filters
- [ ] Activity audit log
- [ ] Document organization by type

**Success Criteria:**
- Managers can monitor team performance without asking
- Contractor reports auto-generated and emailed
- 48-hour compliance automated

---

### Phase 3: Integrations & Scale (Future)

**Goal:** Connect to contractor systems and prepare for external sales

**Potential Features:**
- [ ] Job Nimbus integration (two-way sync)
- [ ] Acculynx integration
- [ ] Contractor portal (read-only access)
- [ ] Mobile-responsive design
- [ ] Custom report builder
- [ ] API for third-party integrations
- [ ] Multi-tenant architecture (SaaS prep)

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **ACV** | Actual Cash Value - depreciated value of property |
| **RCV** | Replacement Cost Value - cost to replace property without depreciation |
| **Initial RCV** | The original RCV from the insurance adjuster's initial estimate |
| **Increase / Supplement** | Additional funds obtained beyond initial estimate |
| **Dollar Per Square** | Key metric = Roof RCV / Total Squares; indicates estimate quality |
| **Supplement** | The process and documents requesting additional claim funds from carrier |
| **Carrier** | Insurance company (State Farm, Allstate, etc.) |
| **Adjuster** | Insurance company representative who evaluates claims |
| **Desk Adjuster** | Remote adjuster who reviews claims without site visit |
| **Field Adjuster** | Adjuster who visits property |
| **Reinspection** | Second inspection requested to review disputed items |
| **Scope** | Detailed list of work items and costs in an estimate |
| **Xactimate** | Industry-standard estimating software |
| **Building Code** | Local regulations that may require upgraded materials/methods |
| **48-Hour Rule** | Rise's commitment to update each claim every 48 hours |
| **Final Invoice** | Invoice sent after work completion for depreciation release |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 | GalaxyCo | Initial PRD based on discovery meeting |

---

## Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Client (Rise) | Brad Gibson | _____________ | _____ |
| Client (Rise) | Jason Pelt | _____________ | _____ |
| Developer | Dalton Cox | _____________ | _____ |

---

*This PRD is a living document and will be updated as requirements evolve through the development process.*
