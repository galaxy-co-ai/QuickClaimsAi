# Rise Roofing Docs - AI Training & Reference Architecture

> **Source of Truth for QuickClaimsAI Knowledge Base**
> 
> Last Updated: January 19, 2026
> Maintained by: Josh Smith (Rise Roofing Supplements) & Dalton Cox (GalaxyCo.ai)

---

## Purpose

This folder contains all reference documents, training data, and knowledge bases that power QuickClaimsAI's intelligent features:

- **Scope Parsing** - Identifying missing items from insurance estimates
- **Argumentation Suggestions** - Code-based arguments for supplements
- **Auto-Classification** - Matching area detection, IRC code lookup
- **Line Item Database** - Xactimate codes and pricing
- **Historical Learning** - Pattern recognition from past successful claims

---

## Folder Structure

```
rise-roofing-docs/
├── README.md                 # You are here
├── past-scopes/              # Historical scopes for AI training
├── irc/                      # International Residential Code references
│   ├── 2018/
│   ├── 2021/
│   └── 2024/
├── regions/                  # Client regions → IRC version mapping
├── argumentation/            # Code-based argument templates
├── matching-areas/           # Cities/counties requiring matching
├── line-items/               # Xactimate build codes & pricing
└── checklists/               # Estimator checklists & expected items
```

---

## Quick Reference: What Goes Where

| File Type | Folder | Example |
|-----------|--------|---------|
| Completed supplement scopes | `/past-scopes/` | `2024-johnson-state-farm.pdf` |
| IRC code PDFs or excerpts | `/irc/2021/` | `chapter-9-roof-assemblies.pdf` |
| Region-to-IRC mappings | `/regions/` | `nebraska-irc-adoption.json` |
| Argument templates | `/argumentation/` | `ice-water-shield-code-argument.md` |
| Matching requirement lists | `/matching-areas/` | `texas-matching-counties.csv` |
| Xactimate line items | `/line-items/` | `xactimate-roofing-jan-2026.csv` |
| Estimator checklists | `/checklists/` | `standard-roof-checklist.md` |

---

## File Naming Conventions

### Past Scopes
```
YYYY-MM_[homeowner-last]_[carrier]_[outcome].pdf
Example: 2025-01_johnson_state-farm_approved.pdf
```

### IRC Documents
```
[chapter-number]-[chapter-name].pdf
Example: 09-roof-assemblies.pdf
```

### Regions
```
[state-abbrev]-irc-adoption.json
Example: ne-irc-adoption.json
```

### Argumentation
```
[item-type]-[argument-type].md
Example: ice-water-shield-code-requirement.md
```

---

## How AI Uses This Data

### 1. Scope Parsing Pipeline
```
New Scope → Compare to /checklists/ → Identify missing items → 
Pull codes from /line-items/ → Generate argument from /argumentation/
```

### 2. Region Detection
```
Property Address → Lookup in /regions/ → Get IRC version → 
Load relevant codes from /irc/[version]/
```

### 3. Matching Area Auto-Flag
```
Property Location → Check /matching-areas/ → 
If found: Flag for matching arguments instead of code arguments
```

### 4. Historical Pattern Learning
```
Search /past-scopes/ for similar:
- Carrier
- Loss type
- Roof type
- Geographic area
→ Pull successful argumentation patterns
```

---

## For Josh: Priority Upload List

### Immediate (This Week)
- [ ] Xactimate line items database → `/line-items/`
- [ ] Standard estimator checklist → `/checklists/`
- [ ] 5-10 successful past scopes → `/past-scopes/`

### Short Term (Next 2 Weeks)
- [ ] Texas/Nebraska/Oklahoma matching requirements → `/matching-areas/`
- [ ] Common argument templates (ice & water, starter, valley) → `/argumentation/`
- [ ] IRC adoption map for active states → `/regions/`

### Medium Term (Month 1)
- [ ] Full IRC chapter excerpts for roofing → `/irc/`
- [ ] Complete matching area database → `/matching-areas/`
- [ ] All carrier-specific argument patterns → `/argumentation/`

---

## Data Format Standards

### JSON Files
```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-19",
  "author": "Josh Smith",
  "data": []
}
```

### CSV Files
- Header row required
- UTF-8 encoding
- No trailing commas

### Markdown Files
- YAML frontmatter for metadata
- Clear section headers
- Code blocks for technical content

---

## Security Notes

- **No PII in training data** - Redact homeowner names, addresses, claim numbers
- **No credentials** - Never store API keys, passwords, or tokens
- **Version control** - All changes tracked via Git

---

## Questions?

Ping in the group chat or:
- **Josh**: Domain questions, what files to prioritize
- **Dalton**: Technical questions, file format issues
