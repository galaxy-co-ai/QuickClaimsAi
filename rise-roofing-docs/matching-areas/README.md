# Matching Areas Database

Cities, counties, and states that require material matching for insurance claims.

## What Goes Here

- Lists of jurisdictions requiring matching
- HOA matching requirements
- Manufacturer warranty matching provisions
- State matching laws/regulations

## Why Matching Matters

When a property is in a "matching area," the argumentation strategy shifts:
- **Standard areas**: Code-based arguments (IRC requirements)
- **Matching areas**: Matching-based arguments (visual uniformity, HOA, laws)

## File Formats

### CSV Format (Preferred for bulk data)
```csv
state,county,city,matching_required,reason,effective_date,source
TX,Harris,Houston,true,state_law,2019-01-01,TX Insurance Code 542
TX,Dallas,Dallas,true,state_law,2019-01-01,TX Insurance Code 542
NE,Douglas,Omaha,false,,,
```

### JSON Format (For detailed entries)
```json
{
  "state": "TX",
  "requirements": [
    {
      "jurisdiction": "statewide",
      "matchingRequired": true,
      "legalBasis": "Texas Insurance Code Section 542.2695",
      "effectiveDate": "2019-09-01",
      "coverage": "Roof, siding, fencing",
      "notes": "Applies to residential policies"
    }
  ]
}
```

## File Naming

```
[state-abbrev]-matching-requirements.csv
[state-abbrev]-matching-requirements.json
```

**Examples:**
- `tx-matching-requirements.csv`
- `ne-matching-requirements.json`
- `hoa-matching-database.csv`

## Priority States

States with known matching laws or high HOA density:
1. **Texas** - State law requires matching
2. **Colorado** - Many HOA requirements
3. **Florida** - State matching provisions
4. **Oklahoma** - Partial requirements
5. **Nevada** - HOA-heavy areas

## How AI Uses These

1. Parse property address
2. Check if location is in matching database
3. If YES:
   - Flag claim for matching arguments
   - Pull matching-based templates from `/argumentation/`
   - Include legal/HOA references
4. If NO:
   - Use standard code-based arguments

## Auto-Flag Feature

When matching is detected, the system will:
- Display "MATCHING AREA" badge on claim
- Suggest matching-specific arguments
- Include relevant legal citations
- Adjust supplement strategy automatically
