# Line Items Database

Xactimate build codes, descriptions, and current pricing.

## What Goes Here

- Complete Xactimate roofing line item catalog
- Monthly price list updates
- Regional pricing variations
- Custom line item definitions

## File Format

### CSV Format (Primary)
```csv
code,description,unit,price,category,notes
RFGDRIP,Drip edge,LF,3.14,flashing,Standard aluminum
RFGSTEP,Step flashing,LF,10.41,flashing,
RFG300,3 tab - 25 yr - comp. shingle rfg - w/ felt,SQ,357.24,shingles,Includes felt
RFGIWS,Ice & water barrier,SF,1.63,underlayment,Self-adhering
RFGASTR,Asphalt starter - peel and stick,LF,1.86,starter,
```

### Required Columns
| Column | Description | Example |
|--------|-------------|---------|
| `code` | Xactimate code | RFGDRIP |
| `description` | Full item description | Drip edge |
| `unit` | Unit of measure | LF, SF, SQ, EA, HR |
| `price` | Current unit price | 3.14 |
| `category` | Item category | flashing, shingles, labor |
| `notes` | Additional notes | Optional |

## File Naming

```
xactimate-roofing-[YYYY-MM].csv
```

**Examples:**
- `xactimate-roofing-2026-01.csv`
- `xactimate-roofing-2026-02.csv`

## Monthly Updates

Xactimate prices update monthly. Process:
1. Export new price list from Xactimate
2. Save as `xactimate-roofing-YYYY-MM.csv`
3. AI will automatically use latest dated file

## Categories

Organize line items by category:
- `shingles` - Roofing materials
- `underlayment` - Felt, ice & water, synthetic
- `flashing` - Drip edge, step, valley, pipe jacks
- `ventilation` - Ridge vents, turbines, caps
- `labor` - Roofer labor, tear-off
- `removal` - Tear-off, haul-off
- `accessories` - Starter, hip/ridge caps
- `steep-high` - Steep/high roof charges

## How AI Uses These

1. Parse incoming scope for line items
2. Identify items NOT in scope (missing items)
3. Look up correct Xactimate code for missing item
4. Pull current pricing for supplement
5. Generate supplement with correct codes & prices

## Regional Pricing

If regional pricing differs significantly:
```
xactimate-roofing-2026-01-TX.csv
xactimate-roofing-2026-01-NE.csv
```

## Priority Data

Josh - export and upload:
1. Current month's full roofing line item list
2. Any custom/regional pricing you use
3. Common code variations (RFGDRIP vs RFGDRIP+)
