# Rise Roofing Supplement Tracking System
## Comprehensive Workflow & Requirements Document

*Prepared for Brad Gibson - January 2026*

---

## Executive Summary

Rise Roofing needs custom software to replace Job Nimbus for supplement tracking. The current system requires manual Excel work because Job Nimbus custom fields don't "talk to each other" - they can't auto-calculate critical metrics like dollar per square or commission percentages.

**Business Model:** Rise charges contractors based on *increase value* (not total revenue) - the difference between initial RCV and final approved RCV.

**Primary Success Metric:** Dollar per square (Roof RCV ÷ Total Squares) - this is the most accurate measure of supplement performance, regardless of claim size.

---

## Core Data Model

### Job Record (Initial Data Entry)
**Required Fields:**
- Policy holder name
- Contractor/location name
- Initial RCV (roof only)
- Total squares
- Claim number
- Insurance carrier
- Adjuster contact info

**Auto-Calculated on Entry:**
- Initial dollar per square = Initial RCV ÷ Total Squares
- Job ID / tracking number
- Date created

### Document Requirements

**Pre-Build Documents:**
1. Insurance Scope of Loss (SOL)
2. Signed Agreement (contractor authorization)
3. Measurement Report (Hover, EagleView, Roofr, or ACT)
4. Photo Inspection (see checklist below)

**Build Day Documents:**
1. Material invoices from suppliers
2. Day-of-build photos (before, during, after)
3. New findings documentation
4. Build completion notification

**Post-Build Documents:**
1. Confirmed line items completed
2. Final photos
3. Depreciation release confirmation

---

## Photo Inspection Checklist

### Required Photos (Minimum Set):
**Ground Level:**
- All 4 elevations

**Roof Top:**
- All corners looking in
- All peaks looking out
- ALL vents & pipe jacks (individual shots)
- Chimney with measurements
- Any misc components (satellite, electric mast, etc.)

**Edge of Roof Details:**
- Starter
- Underlayment
- Drip edge
- Shingle thickness gauge

**Additional:**
- Pitch gauge reading (critical for steep charges)
  - >7:12 = steep charge required
  - 2:12 to 4:12 = double layer underlayment
  - <2:12 = flat roofing system required

**Photo Tips:**
- Chalk all soft metals
- Measure all components
- Capture close, mid-range, and far away
- Before, during, and after build

---

## Build Day Checklist

### Materials Inventory Tracking:
- Shingles bundles (qty ordered vs qty used)
- Hip/ridge bundles
- Starter bundles
- Ice & water rolls

### Items to Document:
- Decking condition/replacement
- Underlayment coverage
- Extra shingles layer removal
- Step flashing
- End wall flashing
- Transition flashing
- Chimney flashing
- Accessories painted
- Ground/roof load issues
- Bad access conditions
- Tarping requirements
- Carrier photo requests

### Photo Requirements:
- Before build (complete set)
- During build (problem areas, additional findings)
- After build (completed work)

---

## 13-Stage Workflow

### Stage 1: Missing Info to Start
**Trigger:** Contractor requests supplement but missing documents/photos  
**Tasks:**
- Full review of submitted materials
- Notify contractor of missing items
- Update job status in both CRMs

### Stage 2: Contractor Review
**Trigger:** Supplement created and uploaded  
**Tasks:**
- Upload estimate to Rise CRM and contractor CRM
- Request contractor approval before sending to carrier
- Make revisions if requested
- Auto-calculate initial metrics

### Stage 3: Supplement Sent to Insurance
**Trigger:** Contractor approval received  
**Tasks:**
- Email to: main carrier email, adjuster, 3rd party (if applicable), homeowner
- Enter detailed note in both CRMs
- Start follow-up schedule

### Stage 4: Supplement Received by Insurance
**Trigger:** Carrier confirms receipt  
**Tasks:**
- Call adjuster/main line to confirm receipt
- Obtain adjuster's direct contact info
- Continue follow-up schedule
- Update both CRMs

### Stage 5: Submitted Counter-Argument
**Trigger:** Received updated SOL with partial denials  
**Tasks:**
- **AUTO-CALCULATE:** New increase value (New RCV - Initial RCV)
- **AUTO-CALCULATE:** New dollar per square (New RCV ÷ Squares)
- **COMMISSION EVENT:** Record SOL 1 commission (5% estimator, 10-15% contractor)
- Send counter-argument email with evidence:
  - Pictures
  - Building codes
  - Additional evidence
  - Material invoice justifications
- Continue follow-up

### Stage 6: Escalated Claim
**Trigger:** Need supervisor/manager assistance  
**Tasks:**
- Contact adjuster's supervisor or team lead
- Follow up with main line
- Progress escalation if no response
- Update both CRMs

### Stage 7: Contractor Required to Advance
**Trigger:** Need contractor action/documents  
**Tasks:**
- Follow up with contractor
- Document what's needed
- Update when received

### Stage 8: Waiting on Build
**Trigger:** Pre-build supplements approved  
**Tasks:**
- Follow up bi-weekly with contractor
- Update Rise CRM with current status
- Track build schedule

### Stage 9: Confirm Work Completed
**Trigger:** Build finished  
**Tasks:**
- Follow up with contractor for line items completed
- Gather day-of-build documentation
- Verify material invoices received
- Prepare for final invoice

### Stage 10: Final Invoice Sent to Carrier
**Trigger:** Work confirmed complete  
**Tasks:**
- **AUTO-CALCULATE:** Total increase from all SOLs
- **AUTO-CALCULATE:** Final dollar per square
- **AUTO-CALCULATE:** All commission totals
- Send final invoice to carrier
- Request depreciation/PWI release
- Call to confirm receipt

### Stage 11: Final Invoice Received by Carrier
**Trigger:** Carrier confirms invoice receipt  
**Tasks:**
- Call adjuster/main line to confirm
- Obtain direct contact (claim may have been reassigned)
- Continue follow-up
- Track approval

### Stage 12: Money Released to Homeowner
**Trigger:** Carrier confirms funds released  
**Tasks:**
- Notate confirmation and final dollar amount in contractor CRM
- Verify amount matches expectations
- Document payment details

### Stage 13: Completed
**Trigger:** All funds released, job finished  
**Tasks:**
- Receive contractor confirmation that supplementing/invoicing complete
- **LOCK FINAL NUMBERS:** Enter all final RCV numbers
- **LOCK COMMISSIONS:** Enter all remaining commissions
- Mark contractor ready to bill
- Generate final report
- Archive job

---

## Auto-Calculation Engine

### Core Formulas

**Dollar Per Square:**
```
Dollar Per Square = Roof RCV ÷ Total Squares
```
*Calculated at: Initial entry, each SOL update, final invoice*

**Increase Value:**
```
Increase Value = New RCV - Previous RCV
```
*Calculated at: Each SOL update*

**Estimator Commission:**
```
Estimator Commission = Total Increase × 5%
```
*Calculated at: Each SOL update (incremental) and final invoice (total)*

**Contractor Billing:**
```
Contractor Billing = Total Increase × (10% to 15%)
```
*Calculated at: Each SOL update (incremental) and final invoice (total)*
*Note: Percentage varies by contractor agreement*

### Calculation Triggers

1. **On Job Creation:**
   - Initial dollar per square

2. **On Each SOL Update:**
   - New increase value
   - Cumulative total increase
   - New dollar per square
   - Incremental estimator commission
   - Incremental contractor billing
   - Updated cumulative commissions

3. **On Final Invoice:**
   - Final dollar per square
   - Total increase (all SOLs combined)
   - Final estimator commission (total)
   - Final contractor billing (total)
   - Success metrics (vs initial estimate)

---

## Reporting Requirements

### Daily Reports

**Estimator Commission Dashboard:**
- Live running total of commissions
- Breakdown by job
- Pending vs. paid
- Current month projection

**Contractor Increase Reports:**
- Daily updates on new increases
- Breakdown by job stage
- Dollar per square trending
- Alert for jobs needing attention

### Job-Specific Reports

**Supplement Summary:**
- Initial RCV
- All SOL increases (itemized)
- Final RCV
- Total increase value
- Dollar per square progression
- Commission breakdown

**Status Board View:**
- Visual kanban/pipeline
- Jobs by status
- Days in current status
- Follow-up schedule
- Red flags/alerts

### Business Analytics

**By Contractor:**
- Total jobs
- Average increase value
- Average dollar per square
- Success rate (approval %)
- Payment status

**By Estimator:**
- Total jobs handled
- Average increase value
- Commission earnings
- Job completion time
- Follow-up effectiveness

**By Adjuster/Carrier:**
- Approval patterns
- Average negotiation time
- Escalation frequency
- Best/worst performers
- Leverage data for future negotiations

---

## Commission Structure

### Standard Supplement (90% of business - Phase 1 focus)

**Estimator:** 5% of total increase value  
**Contractor:** 10-15% of total increase value (per agreement)

### Other Job Types (Future phases)

**Reinspection:** TBD  
**Estimate:** Flat $40 fee  
**Final Invoicing:** TBD

---

## Xactimate Line Item Integration

### Core Line Items (Sample - 99 total available)

**Labor:**
- LABRFG: Roofer ($127.28/hr)
- LABRFG-M: Membrane installer ($98.95/hr)

**Materials - Roofing:**
- RFG300: 3-tab 25yr comp shingle w/ felt ($357.24/SQ)
- RFG300S: Laminated comp shingle w/out felt ($321.04/SQ)
- RFGIWS: Ice & water barrier ($1.63/SF)

**Flashing:**
- RFGSTEP: Step flashing ($10.41/LF)
- RFGDRIP: Drip edge ($3.14/LF)
- RFGFLCH: Avg chimney flashing 32"x36" ($448.99/EA)

**Steep/High Charges:**
- RFGHIGH+: High roof 2+ stories ($25.76/SQ)
- RFGSTEEP: Steep 7/12-9/12 ($56.27/SQ)
- RFGSTEEP+: Steep 10/12-12/12 ($88.44/SQ)

**System Integration:**
- Line item codes map to Xactimate standard
- Pricing updates quarterly (or as needed)
- Custom items can be added with pricing
- Material invoice pricing used for justifications

---

## Notation & Activity Timeline

### Automated Entries:
- Status changes with timestamp
- Commission calculations with amounts
- SOL updates with increase values
- Document uploads with type/date
- Follow-up actions completed

### Manual Entries:
- Phone call summaries
- Email correspondence highlights
- Adjuster conversation notes
- Contractor feedback
- Escalation reasoning
- Build day findings

### Timeline View Requirements:
- Chronological feed
- Filterable by type (status, commission, document, note)
- Searchable
- Printable for contractor reports
- Exportable for records

---

## Update Frequency Requirements

*These are non-negotiable commitments from Rise to contractors:*

**Every Other Business Day:**
- Each job updated in detail in both CRMs
- Contractor questions/messages answered

**Same Day:**
- New job requests completed and uploaded
- Final invoice requests completed and uploaded
- Contractor emails received before 4pm responded to

**Bi-Weekly:**
- Waiting on Build jobs checked and updated

---

## User Roles & Views (Future Phase)

### Estimator View:
- Full access to all job data
- Commission dashboard
- Daily task list
- Status management
- Document upload
- Communication tools

### Contractor View:
- Job status visibility
- Commission calculations
- Document access
- Timeline/notes
- Approval workflows
- Reporting

### Manager View:
- Team performance metrics
- Job oversight
- Escalation handling
- Quality audits
- Business analytics

### Sales/Admin View:
- Limited read access
- Reporting only
- No PII access

---

## Risk Management Features

### High-Risk Job Indicators:
- Large deductibles (2%+)
- ACV, RPS policies
- Large claims ($40K+)
- Missing structures in initial scope
- No signed agreement on file

### Roofer Protection Form:
For big claims, homeowner agrees to pay 20% of increase as a fee if they choose not to proceed with work for any reason.

**When to require:**
- Claims over $40K
- High-risk indicators present
- Prior homeowner issues
- Complex multi-supplement jobs

---

## Phase 1 Priorities

### Must-Have (MVP):
1. Job creation with core data entry
2. 13-stage status workflow
3. Auto-calculations (dollar per square, increase, commissions)
4. Document housing and organization
5. Activity timeline/notes
6. Estimator commission dashboard
7. Contractor increase reports
8. Basic status board view

### Nice-to-Have (Phase 1.5):
1. Drag-and-drop status changes
2. Bulk update capabilities
3. Advanced search/filtering
4. Email integration
5. Notification system

### Future Phases:
1. Mobile app
2. Xactimate direct integration
3. Multiple job types (reinspection, estimate)
4. Role-based access control
5. Advanced analytics
6. CRM integrations
7. API for third-party tools

---

## Success Metrics

### System Effectiveness:
- Reduction in Excel usage (target: 100% elimination)
- Time saved per job (target: 15-20 minutes)
- Data entry errors (target: <1%)
- Report generation time (target: <30 seconds)

### Business Impact:
- Average dollar per square improvement
- Time from supplement sent to approval
- Contractor satisfaction scores
- Estimator efficiency gains
- Commission payment accuracy

---

## Technical Considerations

### Data Storage:
- Secure cloud storage for documents
- Database for job/commission data
- Backup and redundancy
- HIPAA-like data protection (PII handling)

### Integration Points:
- Email systems (Gmail)
- Document scanning/upload
- Photo storage and organization
- Report generation
- Export capabilities (Excel, PDF)

### Performance:
- Page load time <2 seconds
- Report generation <30 seconds
- Document upload/download fast
- Search results instant
- Mobile-responsive (future)

---

## Key Differentiators from Job Nimbus

1. **Fields that calculate:** Custom fields interact and auto-calculate derived metrics
2. **Eliminate Excel:** All reporting and commission tracking in-system
3. **Purpose-built for supplements:** Not a general CRM trying to fit this workflow
4. **Dollar per square focus:** Built around the metric that matters most
5. **Commission automation:** No manual spreadsheet tracking ever
6. **Increase-based model:** Designed for the unique Rise business model

---

## Next Steps

1. **Review this workflow** - Brad provides feedback via email
2. **Prioritize features** - Identify Phase 1 must-haves
3. **UI/UX mockups** - Visual representation of key screens
4. **Database design** - Schema for jobs, commissions, documents
5. **Development sprint planning** - Break into 2-week iterations
6. **Friday noon meeting** - Review progress and next steps

---

*Document prepared from: Meeting transcript 01/09/26, Status Updates PDF, Contractor Guide 2025, New Hire Packet 2025, Inspection Checklist, Build Day Checklist, Xactimate Catalog*
