# Estimator Checklists

Standard checklists for identifying missing items in insurance scopes.

## What Goes Here

- Standard roof supplement checklist
- Specialty checklists (commercial, tile, metal)
- Carrier-specific checklists
- Training documents

## Primary Checklist Format

### Markdown Checklist
```markdown
---
type: standard-roof
version: 1.0
lastUpdated: 2026-01-19
author: Josh Smith
---

# Standard Roof Supplement Checklist

## Required Items (Always Check)
- [ ] Starter shingle
- [ ] Drip edge (eave and rake)
- [ ] Ice & water shield (if applicable)
- [ ] Valley lining
- [ ] Pipe jacks
- [ ] Ridge vent / ventilation
- [ ] Hip and ridge caps

## Conditional Items
### If steep roof (7/12+)
- [ ] Steep slope charge

### If 2+ stories
- [ ] High roof charge

### If tear-off
- [ ] Tear-off labor
- [ ] Haul-off / disposal

### If flashing present
- [ ] Step flashing
- [ ] Counter flashing
- [ ] Chimney flashing

## Common Missing Items
1. Starter shingle (most common)
2. Drip edge (frequently under-scoped)
3. Ice & water shield (code requirement)
4. Detach & reset items (vents, dishes, etc.)
```

## File Naming

```
[checklist-type]-checklist.md
```

**Examples:**
- `standard-roof-checklist.md`
- `commercial-roof-checklist.md`
- `metal-roof-checklist.md`
- `state-farm-specific-checklist.md`

## How AI Uses These

### Scope Parsing Pipeline
```
1. AI receives insurance scope
2. Parses all line items from scope
3. Compares against checklist "Required Items"
4. Flags any missing items
5. Generates supplement with missing items
```

### Missing Item Detection
For each checklist item:
- Check if item exists in scope
- If missing AND applicable → flag for supplement
- Pull Xactimate code from `/line-items/`
- Pull argument from `/argumentation/`

## Priority Checklists

Josh - create and upload:

### Immediate
1. **Standard Roof Checklist** - Your go-to list for 90% of jobs
2. **Quick Reference Card** - Top 10 most commonly missed items

### Short Term
3. **Carrier-Specific Checklists** - Known quirks per carrier
4. **Regional Checklists** - State-specific requirements

## Training Value

These checklists also serve as:
- Onboarding documents for new estimators
- Consistency tool (everyone checks same items)
- Quality control reference
- Performance benchmark
