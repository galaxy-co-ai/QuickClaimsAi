# Argumentation Templates

Code-based and matching-based argument templates for supplement justification.

## What Goes Here

- Argument templates for common supplement items
- Code reference frameworks
- Carrier-specific response patterns
- Counter-argument strategies

## File Structure

### Markdown Template
```markdown
---
item: ice-water-shield
category: code-requirement
applicableStates: [NE, IA, SD, MN]
ircReference: R905.2.7.1
effectiveDate: 2021-01-01
---

# Ice & Water Shield - Code Requirement Argument

## Summary
[One-line summary for quick reference]

## Code Reference
> IRC R905.2.7.1: Ice barrier... [exact quote]

## Argument Template
[Full argument text with placeholders]

## Carrier-Specific Notes
- **State Farm**: Tends to approve with code reference
- **Allstate**: May require additional documentation
- **Travelers**: Usually approves immediately

## Counter-Arguments
If denied, respond with:
1. [Counter-argument 1]
2. [Counter-argument 2]
```

## Common Argument Categories

### Code-Based Arguments
- Ice & water shield requirements
- Starter shingle requirements  
- Valley lining specifications
- Drip edge requirements
- Ventilation code compliance

### Matching Arguments
- Color discontinuation
- Profile discontinuation
- Manufacturer warranty requirements
- HOA requirements

### Material/Labor Arguments
- High roof charges
- Steep slope charges
- Detach & reset items
- Haul-off requirements

## File Naming

```
[item-type]-[argument-basis].md
```

**Examples:**
- `ice-water-shield-code-requirement.md`
- `starter-shingle-manufacturer-spec.md`
- `shingle-matching-color-discontinuation.md`
- `valley-lining-irc-requirement.md`

## Priority Arguments to Document

Josh - document your most-used arguments:
1. Ice & water shield (code)
2. Starter shingle (code + manufacturer)
3. Valley metal/lining (code)
4. Drip edge (code)
5. Matching (color/profile discontinuation)

## How AI Uses These

1. Identify missing item in scope
2. Pull relevant argument template
3. Auto-insert correct code references
4. Customize for specific carrier
5. Present to estimator for review/approval
