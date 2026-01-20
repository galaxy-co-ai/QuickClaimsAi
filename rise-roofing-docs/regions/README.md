# Regions - IRC Adoption Mapping

Maps client regions to the correct IRC version and state-specific requirements.

## What Goes Here

- State IRC adoption records
- City/county code amendment documents
- Regional requirement databases

## File Format

### JSON Structure (Preferred)
```json
{
  "state": "NE",
  "stateName": "Nebraska",
  "ircVersion": "2021",
  "adoptionDate": "2022-01-01",
  "amendments": [
    {
      "section": "R905.2.7",
      "description": "Ice barrier requirement expanded",
      "localRequirement": "Ice barrier required in all counties"
    }
  ],
  "majorCities": [
    {
      "city": "Omaha",
      "county": "Douglas",
      "localAmendments": true,
      "notes": "Additional wind requirements"
    }
  ]
}
```

## File Naming

```
[state-abbrev]-irc-adoption.json
```

**Examples:**
- `ne-irc-adoption.json`
- `tx-irc-adoption.json`
- `ok-irc-adoption.json`

## Priority States

Based on Rise's current client base:
1. Nebraska (NE)
2. Texas (TX)
3. Oklahoma (OK)
4. Kansas (KS)
5. Colorado (CO)

## How AI Uses These

1. Property address → State lookup → Get IRC version
2. Load correct IRC rules from `/irc/[version]/`
3. Apply any state-specific amendments to arguments
4. Flag unusual local requirements

## Helpful Resources

- ICC (International Code Council) adoption map
- State building code office websites
- Local jurisdiction websites
